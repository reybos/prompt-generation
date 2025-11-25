/* START GENAI */
/**
 * Base pipeline implementation
 * Universal pipeline logic that can be configured for different pipeline types
 */

import { PipelineOptions, LLMRequest } from '../types/pipeline.js';
import { executePipelineStepWithTracking, safeJsonParse } from '../utils/index.js';
import { splitLyricsIntoSegments, groupVideoPromptsIntoSegments, savePipelineResult } from '../utils/pipelineCommon.js';
import { PipelineConfig } from './pipelineConfig.js';
import { generateGroupFrames, ImagePromptWithLine, GroupFrameResult } from './generateGroupFrames.js';
import config from '../config/index.js';

/**
 * Base pipeline result structure
 */
export interface BasePipelineResult<TImagePrompt, TVideoPrompt, TGroupFrame> {
  prompts?: TImagePrompt[]; // Optional when skipImageStep is true
  video_prompts: TVideoPrompt[];
  titles: string[];
  group_frames?: TGroupFrame[];
  requests?: LLMRequest[];
}

/**
 * Input item with lyrics
 */
export interface LyricsInputItem {
  lyrics: string;
}

/**
 * Run the base pipeline with given configuration
 * @param input - Array of input items with lyrics
 * @param config - Pipeline configuration
 * @param options - Pipeline options
 * @returns Array of pipeline results
 */
export async function runBasePipeline<
  TInputItem extends LyricsInputItem,
  TImagePrompt extends ImagePromptWithLine,
  TVideoPrompt extends { index: number; line: string; [key: string]: any },
  TOutput extends BasePipelineResult<TImagePrompt, TVideoPrompt, GroupFrameResult>
>(
  input: TInputItem[],
  pipelineConfig: PipelineConfig<TImagePrompt, TVideoPrompt>,
  options: PipelineOptions = {}
): Promise<TOutput[]> {
  const results: TOutput[] = [];
  const pipelineIdentifier = pipelineConfig.getPipelineIdentifier(options);
  const maxAttempts = 3;

  for (const song of input) {
    const lyrics = song.lyrics;
    const segments = splitLyricsIntoSegments(lyrics);

    let attempt = 0;
    let finished = false;
    
    while (attempt < maxAttempts && !finished) {
      attempt++;
      const requests: LLMRequest[] = [];
      
      // If skipImageStep is not defined, default to false (don't skip)
      const shouldSkipImageStep = pipelineConfig.skipImageStep === true;
      
      try {
        if (options.emitLog && options.requestId) {
          options.emitLog(`${pipelineConfig.pipelineName} (${pipelineIdentifier})... (Attempt ${attempt})`, options.requestId);
        }

        // Step 1: Generate image prompts (skip if skipImageStep is true)
        let prompts: TImagePrompt[] = [];
        
        if (!shouldSkipImageStep) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`🖼️ Generating image prompts for ${segments.length} segments...`, options.requestId);
          }

          // Create image prompt with style
          if (!pipelineConfig.prompts.createImagePrompt) {
            throw new Error('createImagePrompt is required when skipImageStep is false');
          }
          
          const imagePromptWithStyle = pipelineConfig.prompts.createImagePrompt(pipelineIdentifier);
          const imageJson: string | Record<string, any> | null = await executePipelineStepWithTracking({
            stepName: pipelineConfig.stepNames.image,
            promptTemplate: imagePromptWithStyle,
            options: { 
              model: pipelineConfig.models.image.model, 
              temperature: pipelineConfig.models.image.temperature 
            },
            params: { songLyrics: lyrics },
            requests
          });

          if (imageJson) {
            const parsed = typeof imageJson === 'string' 
              ? safeJsonParse(imageJson, pipelineConfig.stepNames.image) 
              : imageJson;
            
            if (parsed && typeof parsed === 'object') {
              const rawPrompts = Array.isArray(parsed.prompts) ? parsed.prompts : [];
              // Add indices to image prompts (starting from 0)
              prompts = rawPrompts.map((prompt: any, index: number) => ({
                ...prompt,
                index: index
              })) as TImagePrompt[];
              
              // Apply post-processing if configured
              if (pipelineConfig.postProcessImagePrompts) {
                prompts = pipelineConfig.postProcessImagePrompts(prompts);
              }
            }
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to generate image prompts. Retrying...`, options.requestId);
            }
            break;
          }
        } else {
          if (options.emitLog && options.requestId) {
            options.emitLog(`⏭️ Skipping image prompts generation (direct video mode)...`, options.requestId);
          }
          // Ensure prompts is empty when skipping
          prompts = [];
        }

        // Step 2: Generate video prompts
        if (options.emitLog && options.requestId) {
          if (shouldSkipImageStep) {
            options.emitLog(`🎬 Generating video prompts directly from poem lyrics...`, options.requestId);
          } else {
            options.emitLog(`🎬 Generating video prompts for ${prompts.length} image prompts...`, options.requestId);
          }
        }
        
        let videoPrompts: TVideoPrompt[] = [];
        let videoJson: string | Record<string, any> | null = null;
        
        try {
          let videoParams: Record<string, any>;
          
          if (shouldSkipImageStep) {
            // Generate video prompts directly from lyrics
            if (pipelineConfig.formatters.buildVideoParamsFromLyrics) {
              videoParams = pipelineConfig.formatters.buildVideoParamsFromLyrics(lyrics);
            } else {
              videoParams = { songLyrics: lyrics };
            }
            
            // Log video prompt
            pipelineConfig.loggers.logVideoPrompt(lyrics);
          } else {
            // Format image prompts for video step
            if (!pipelineConfig.formatters.formatImagePromptsForVideo) {
              throw new Error('formatImagePromptsForVideo is required when skipImageStep is not true');
            }
            
            const imagePromptsFormatted = pipelineConfig.formatters.formatImagePromptsForVideo(prompts);
            
            // Log video prompt
            pipelineConfig.loggers.logVideoPrompt(imagePromptsFormatted);
            
            // Build params for video step (use custom builder if provided, otherwise default)
            videoParams = pipelineConfig.formatters.buildVideoParams
              ? pipelineConfig.formatters.buildVideoParams(imagePromptsFormatted)
              : { 
                  image_prompts: imagePromptsFormatted
                };
          }
          
          videoJson = await executePipelineStepWithTracking({
            stepName: pipelineConfig.stepNames.video,
            promptTemplate: pipelineConfig.prompts.videoPrompt,
            options: { 
              model: pipelineConfig.models.video.model, 
              temperature: pipelineConfig.models.video.temperature 
            },
            params: videoParams,
            requests
          });
          
          if (videoJson) {
            const parsed = typeof videoJson === 'string' 
              ? safeJsonParse(videoJson, pipelineConfig.stepNames.video) 
              : videoJson;
            
            if (options.emitLog && options.requestId) {
              options.emitLog(`🔍 Video prompts parsing: ${JSON.stringify(parsed).substring(0, 200)}...`, options.requestId);
            }
            
            const parsedPrompts = pipelineConfig.parsers.parseVideoPrompts(parsed, options);
            if (parsedPrompts) {
              videoPrompts = parsedPrompts;
              
              // Apply post-processing if configured
              if (pipelineConfig.postProcessVideoPrompts) {
                videoPrompts = pipelineConfig.postProcessVideoPrompts(videoPrompts);
              }
              
              if (options.emitLog && options.requestId) {
                options.emitLog(`✅ Successfully parsed ${videoPrompts.length} video prompts`, options.requestId);
              }
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`⚠️ Video prompts parsing issue`, options.requestId);
              }
            }
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to generate video prompts. Retrying...`, options.requestId);
            }
            break; // Retry the whole song
          }
        } catch (e) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Error generating video prompts: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
          }
          break; // Retry the whole song
        }

        // Step 3: Generate titles
        if (options.emitLog && options.requestId) {
          options.emitLog(`🏷️ Generating titles...`, options.requestId);
        }

        // Group video prompts into segments
        const videoSegments = groupVideoPromptsIntoSegments(videoPrompts);
        if (options.emitLog && options.requestId) {
          options.emitLog(`📚 Grouped ${videoPrompts.length} video prompts into ${videoSegments.length} segments of ${config.songSegmentLines} lines each`, options.requestId);
        }

        const titles: string[] = [];

        // Generate title for each segment
        if (options.emitLog && options.requestId) {
          options.emitLog(`🏷️ Generating titles for ${videoSegments.length} segments...`, options.requestId);
        }
        
        for (let segmentIndex = 0; segmentIndex < videoSegments.length; segmentIndex++) {
          const segment = videoSegments[segmentIndex];
          if (!segment || segment.length === 0) {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Segment ${segmentIndex + 1} is empty. Skipping...`, options.requestId);
            }
            continue;
          }
          
          if (options.emitLog && options.requestId) {
            options.emitLog(`🏷️ Generating title for segment ${segmentIndex + 1}/${videoSegments.length} (${segment.length} video prompts)...`, options.requestId);
          }
          
          // Combine all lines from the segment
          const segmentLines = segment.map(prompt => prompt.line).join('\n');
          // Combine all video prompts from the segment
          // All video prompt types have video_prompt property
          const segmentVideoPrompts = segment.map(prompt => {
            const videoPrompt = (prompt as any).video_prompt;
            return videoPrompt || '';
          }).join('\n\n');
          
          let title = '';
          let titleJson: string | Record<string, any> | null = null;
          
          try {
            // Log title prompt
            pipelineConfig.loggers.logTitlePrompt(segmentLines, segmentVideoPrompts);
            
            titleJson = await executePipelineStepWithTracking({
              stepName: pipelineConfig.stepNames.title,
              promptTemplate: pipelineConfig.prompts.titlePrompt,
              options: { 
                model: pipelineConfig.models.title.model, 
                temperature: pipelineConfig.models.title.temperature 
              },
              params: { 
                songLyrics: segmentLines,
                videoPrompt: segmentVideoPrompts
              },
              requests
            });
            
            if (titleJson) {
              const parsed = typeof titleJson === 'string' 
                ? safeJsonParse(titleJson, pipelineConfig.stepNames.title) 
                : titleJson;
              
              if (parsed && typeof parsed === 'object') {
                title = parsed.title || '';
              }
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`❌ Failed to generate title for segment ${segmentIndex + 1}. Retrying...`, options.requestId);
              }
              break; // Retry the whole song
            }
          } catch (e) {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Error generating title for segment ${segmentIndex + 1}: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
            }
            break; // Retry the whole song
          }
          
          titles.push(title);
        }

        // Check if we have all the required data
        if (titles.length === videoSegments.length) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`✅ Successfully generated all titles!`, options.requestId);
          }
        } else {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Incomplete data generated. Expected ${videoSegments.length} titles, got: ${titles.length}. Retrying...`, options.requestId);
          }
          continue; // Retry the whole song
        }

        // Step 4: Generate group frames (if requested)
        // Note: generateGroupFrames may need prompts, but if skipImageStep is true, we pass empty array
        // The function should handle this case or we need to modify it
        let groupFrames = await generateGroupFrames(
          prompts.length > 0 ? prompts : [] as any,
          pipelineConfig,
          options,
          requests
        );

        // Apply post-processing to group frames if configured
        if (pipelineConfig.postProcessGroupFrames && groupFrames.length > 0) {
          groupFrames = pipelineConfig.postProcessGroupFrames(groupFrames);
        }

        // Create result object
        // If skipImageStep is true, don't include prompts field (undefined)
        const songResult: any = {
          prompts: prompts.length > 0 ? prompts : undefined,
          video_prompts: videoPrompts,
          titles,
          group_frames: groupFrames.length > 0 ? groupFrames : undefined,
          requests: requests.length > 0 ? requests : undefined
        };
        
        results.push(songResult);

        // Save to file
        await savePipelineResult(songResult, pipelineIdentifier, options);
        
        if (options.emitLog && options.requestId) {
          options.emitLog(`✅ Generation finished (${pipelineIdentifier})`, options.requestId);
        }
        
        finished = true;
      } catch (error) {
        if (options.emitLog && options.requestId) {
          options.emitLog(`❌ Error generating song: ${error instanceof Error ? error.message : String(error)}`, options.requestId);
        }
        if (attempt >= maxAttempts) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`🚫 Failed to generate song after ${maxAttempts} attempts. Skipping.`, options.requestId);
          }
        }
      }
    }
  }

  return results;
}

/* END GENAI */

