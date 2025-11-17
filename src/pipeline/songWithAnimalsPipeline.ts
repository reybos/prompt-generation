import { SongWithAnimalsInput, SongWithAnimalsOutput, SongWithAnimalsImagePrompt, SongWithAnimalsVideoPrompt, SongWithAnimalsAdditionalFramePrompt, LLMRequest } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { createImagePromptWithStyle } from '../promts/song_with_animals/imagePrompt.js';
import { getStyle } from '../promts/song_with_animals/styles/styleConfig.js';
import { songWithAnimalsVideoPrompt, songWithAnimalsTitlePrompt, logVideoPrompt, logTitlePrompt, songWithAnimalsGroupImagePrompt, songWithAnimalsGroupVideoPrompt, logSongWithAnimalsGroupImagePrompt, logSongWithAnimalsGroupVideoPrompt } from '../promts/index.js';
import { createChain } from '../chains/index.js';
import { executePipelineStep, executePipelineStepWithTracking, safeJsonParse } from '../utils/index.js';
import config from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';
import { getGenerationsDir } from '../server.js';
import { getNextFileNumber } from '../utils/fileUtils.js';

/**
 * Split lyrics into segments based on configuration
 * @param lyrics - Full song lyrics
 * @returns Array of segments with configured number of lines
 */
function splitLyricsIntoSegments(lyrics: string): string[] {
  const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
  const segments: string[] = [];
  const segmentLines = config.songSegmentLines;
  
  for (let i = 0; i < lines.length; i += segmentLines) {
    const segment = lines.slice(i, i + segmentLines).join('\n');
    if (segment.trim()) {
      segments.push(segment);
    }
  }
  
  return segments;
}

/**
 * Group video prompts into segments based on configuration
 * @param video_prompts - Array of video prompts
 * @returns Array of segments with configured number of video prompts
 */
function groupVideoPromptsIntoSegments(video_prompts: SongWithAnimalsVideoPrompt[]): SongWithAnimalsVideoPrompt[][] {
    const segments: SongWithAnimalsVideoPrompt[][] = [];
    const segmentLines = config.songSegmentLines;
    
    for (let i = 0; i < video_prompts.length; i += segmentLines) {
        const segment = video_prompts.slice(i, i + segmentLines);
        if (segment.length > 0) {
            segments.push(segment);
        }
    }
    
    return segments;
}

/**
 * Run the complete song with animals generation pipeline (including titles, descriptions and hashtags)
 * @param input - The song with animals input (array of song objects with lyrics)
 * @param options - Pipeline options
 * @returns The generated song with animals outputs (one per song)
 */
export async function runSongWithAnimalsPipeline(
  input: SongWithAnimalsInput,
  options: PipelineOptions = {}
): Promise<SongWithAnimalsOutput[]> {
  const results: SongWithAnimalsOutput[] = [];
  const selectedStyle = options.style || 'default'; // Используем переданный стиль или дефолтный

  for (const song of input) {
    const lyrics = song.lyrics;
    const segments = splitLyricsIntoSegments(lyrics);

    // Set models and temperatures for each step
    const imageModel = 'openai/gpt-5-chat';
    const imageTemperature = 0.3;
    const videoModel = 'anthropic/claude-3.7-sonnet';
    const videoTemperature = 0.5;
    const titleModel = 'openai/gpt-5-chat';
    const titleTemperature = 0.7;

    let attempt = 0;
    const maxAttempts = 3;
    let finished = false;
    while (attempt < maxAttempts && !finished) {
      attempt++;
      const requests: LLMRequest[] = [];
      try {
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎵 Generating song with animals with ${selectedStyle} style... (Attempt ${attempt})`, options.requestId);
        }

        // Step 1: Generate image prompts with selected style
        if (options.emitLog && options.requestId) {
          options.emitLog(`🖼️ Generating image prompts for ${segments.length} segments using ${selectedStyle} style...`, options.requestId);
        }
        
        // Получаем стиль и устанавливаем globalStyle на уровне пайплайна
        let globalStyle = '';
        try {
          const style = getStyle(selectedStyle);
          if (style.globalStyle) {
            globalStyle = style.globalStyle;
            if (options.emitLog && options.requestId) {
              options.emitLog(`🎨 Using predefined globalStyle from ${selectedStyle} style`, options.requestId);
            }
          }
        } catch (error) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`⚠️ Could not load style ${selectedStyle}: ${error instanceof Error ? error.message : String(error)}`, options.requestId);
          }
        }

        // Создаем промт с выбранным стилем
        const imagePromptWithStyle = createImagePromptWithStyle(selectedStyle);
        const imageJson: string | Record<string, any> | null = await executePipelineStepWithTracking(
          'SONG WITH ANIMALS IMAGE PROMPTS',
          imagePromptWithStyle,
          { model: imageModel, temperature: imageTemperature },
          { songLyrics: lyrics },
          requests
        );
        let prompts: SongWithAnimalsImagePrompt[] = [];
        if (imageJson) {
          const parsed = typeof imageJson === 'string' ? safeJsonParse(imageJson, 'SONG WITH ANIMALS IMAGE PROMPTS') : imageJson;
          if (parsed && typeof parsed === 'object') {
            // Если globalStyle не был установлен из стиля, используем сгенерированный
            if (!globalStyle && parsed.global_style) {
              globalStyle = parsed.global_style;
              if (options.emitLog && options.requestId) {
                options.emitLog(`🎨 Using generated globalStyle from LLM`, options.requestId);
              }
            }
            const rawPrompts = Array.isArray(parsed.prompts) ? parsed.prompts : [];
            // Add indices to image prompts (starting from 0)
            prompts = rawPrompts.map((prompt, index) => ({
              ...prompt,
              index: index
            }));
          }
        } else {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Failed to generate image prompts. Retrying...`, options.requestId);
          }
          break;
        }

        // Step 2: Generate video prompts
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎬 Generating video prompts for ${prompts.length} image prompts...`, options.requestId);
        }
        let videoPrompts: SongWithAnimalsVideoPrompt[] = [];
        let videoJson: string | Record<string, any> | null = null;
        try {
          // Prepare image prompts as formatted string for the prompt
          const imagePromptsFormatted = prompts.map(p => `Line: "${p.line}"\nPrompt: ${p.prompt}`).join('\n\n');
          
          // Логируем видео промт в консоль
          logVideoPrompt(globalStyle, imagePromptsFormatted);
          
          videoJson = await executePipelineStepWithTracking(
            'SONG WITH ANIMALS VIDEO PROMPTS',
            songWithAnimalsVideoPrompt,
            { model: videoModel, temperature: videoTemperature },
            { 
              global_style: globalStyle,
              image_prompts: imagePromptsFormatted
            },
            requests
          );
          if (videoJson) {
            const parsed = typeof videoJson === 'string' ? safeJsonParse(videoJson, 'SONG WITH ANIMALS VIDEO PROMPTS') : videoJson;
            if (options.emitLog && options.requestId) {
              options.emitLog(`🔍 Video prompts parsing: ${JSON.stringify(parsed).substring(0, 200)}...`, options.requestId);
            }
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.video_prompts)) {
              const rawVideoPrompts = parsed.video_prompts;
              // Add indices to video prompts (starting from 0)
              videoPrompts = rawVideoPrompts.map((prompt, index) => ({
                ...prompt,
                index: index
              }));
              if (options.emitLog && options.requestId) {
                options.emitLog(`✅ Successfully parsed ${videoPrompts.length} video prompts`, options.requestId);
              }
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`⚠️ Video prompts parsing issue: parsed.video_prompts is not an array`, options.requestId);
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
          const segmentVideoPrompts = segment.map(prompt => prompt.video_prompt).join('\n\n');
          
          let title = '';
          let titleJson: string | Record<string, any> | null = null;
          try {
            // Логируем title промт в консоль
            logTitlePrompt(segmentLines, segmentVideoPrompts, globalStyle);
            
            titleJson = await executePipelineStepWithTracking(
              'SONG WITH ANIMALS TITLE',
              songWithAnimalsTitlePrompt,
              { model: titleModel, temperature: titleTemperature },
              { 
                songLyrics: segmentLines,
                videoPrompt: segmentVideoPrompts,
                globalStyle: globalStyle
              },
              requests
            );
            if (titleJson) {
              const parsed = typeof titleJson === 'string' ? safeJsonParse(titleJson, 'SONG WITH ANIMALS TITLE') : titleJson;
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

        // Step 4: Generate additional group frames (if requested)
        let additionalFrames: SongWithAnimalsAdditionalFramePrompt[] = [];
        if (options.generateAdditionalFrames) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`🎬 Generating group frames (every 3 characters)...`, options.requestId);
          }

          try {
            const groupImageModel = 'anthropic/claude-3.7-sonnet';
            const groupImageTemperature = 0.6;
            const groupVideoModel = 'anthropic/claude-3.7-sonnet';
            const groupVideoTemperature = 0.5;

            // Group prompts by 3
            const groups: SongWithAnimalsImagePrompt[][] = [];
            for (let i = 0; i < prompts.length; i += 3) {
              const group = prompts.slice(i, i + 3);
              if (group.length === 3) {
                groups.push(group);
              }
            }

            if (options.emitLog && options.requestId) {
              options.emitLog(`📚 Created ${groups.length} groups of 3 characters each`, options.requestId);
            }

            // Generate group image and video prompts for each group
            for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
              const group = groups[groupIndex];
              if (!group) continue;
              
              if (options.emitLog && options.requestId) {
                options.emitLog(`🎨 Generating group ${groupIndex + 1}/${groups.length}...`, options.requestId);
              }

              // Prepare three character prompts for this group
              const threePrompts = group.map(p => `Line: "${p.line}"\nPrompt: ${p.prompt}`).join('\n\n');
              
              // Generate group image prompt with retry logic
              let groupImagePrompt = '';
              let imageAttempts = 0;
              const maxImageAttempts = 3;
              
              while (imageAttempts < maxImageAttempts && !groupImagePrompt) {
                imageAttempts++;
                
                if (options.emitLog && options.requestId) {
                  options.emitLog(`🖼️ Generating group image prompt (attempt ${imageAttempts}/${maxImageAttempts})...`, options.requestId);
                }
                
                logSongWithAnimalsGroupImagePrompt(globalStyle, threePrompts);
                
                const groupImageJson: string | Record<string, any> | null = await executePipelineStepWithTracking(
                  'SONG WITH ANIMALS GROUP IMAGE',
                  songWithAnimalsGroupImagePrompt,
                  { 
                    model: groupImageModel, 
                    temperature: groupImageTemperature 
                  },
                  { 
                    globalStyle: globalStyle,
                    prompts: threePrompts
                  },
                  requests
                );

                if (groupImageJson) {
                  const parsed = typeof groupImageJson === 'string' ? 
                    safeJsonParse(groupImageJson, 'SONG WITH ANIMALS GROUP IMAGE') : groupImageJson;
                  
                  if (parsed && typeof parsed === 'object' && parsed.group_image_prompt) {
                    const candidatePrompt = parsed.group_image_prompt;
                    
                    // Validate prompt length (max 1500 characters)
                    if (candidatePrompt.length <= 1500) {
                      groupImagePrompt = candidatePrompt;
                      if (options.emitLog && options.requestId) {
                        options.emitLog(`✅ Group image prompt generated (${candidatePrompt.length} characters)`, options.requestId);
                      }
                    } else {
                      if (options.emitLog && options.requestId) {
                        options.emitLog(`⚠️ Group image prompt too long: ${candidatePrompt.length} characters (max 1500). Retrying...`, options.requestId);
                      }
                    }
                  }
                }
                
                if (!groupImagePrompt && imageAttempts < maxImageAttempts) {
                  // Wait a bit before retry
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }

              if (!groupImagePrompt) {
                if (options.emitLog && options.requestId) {
                  options.emitLog(`❌ Failed to generate group image prompt for group ${groupIndex + 1} after ${maxImageAttempts} attempts. Skipping...`, options.requestId);
                }
                continue;
              }

              // Generate group video prompt with retry logic
              let groupVideoPrompt = '';
              let videoAttempts = 0;
              const maxVideoAttempts = 3;
              
              while (videoAttempts < maxVideoAttempts && !groupVideoPrompt) {
                videoAttempts++;
                
                if (options.emitLog && options.requestId) {
                  options.emitLog(`🎬 Generating group video prompt (attempt ${videoAttempts}/${maxVideoAttempts})...`, options.requestId);
                }
                
                logSongWithAnimalsGroupVideoPrompt(groupImagePrompt);
                
                const groupVideoJson: string | Record<string, any> | null = await executePipelineStepWithTracking(
                  'SONG WITH ANIMALS GROUP VIDEO',
                  songWithAnimalsGroupVideoPrompt,
                  { 
                    model: groupVideoModel, 
                    temperature: groupVideoTemperature 
                  },
                  { 
                    groupImagePrompt: groupImagePrompt
                  },
                  requests
                );

                if (groupVideoJson) {
                  const parsed = typeof groupVideoJson === 'string' ? 
                    safeJsonParse(groupVideoJson, 'SONG WITH ANIMALS GROUP VIDEO') : groupVideoJson;
                  
                  if (parsed && typeof parsed === 'object' && parsed.group_video_prompt) {
                    const candidatePrompt = parsed.group_video_prompt;
                    
                    // Validate prompt length (max 1500 characters)
                    if (candidatePrompt.length <= 1500) {
                      groupVideoPrompt = candidatePrompt;
                      if (options.emitLog && options.requestId) {
                        options.emitLog(`✅ Group video prompt generated (${candidatePrompt.length} characters)`, options.requestId);
                      }
                    } else {
                      if (options.emitLog && options.requestId) {
                        options.emitLog(`⚠️ Group video prompt too long: ${candidatePrompt.length} characters (max 1500). Retrying...`, options.requestId);
                      }
                    }
                  }
                }
                
                if (!groupVideoPrompt && videoAttempts < maxVideoAttempts) {
                  // Wait a bit before retry
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }

              if (!groupVideoPrompt) {
                if (options.emitLog && options.requestId) {
                  options.emitLog(`❌ Failed to generate group video prompt for group ${groupIndex + 1} after ${maxVideoAttempts} attempts. Skipping...`, options.requestId);
                }
                continue;
              }

              // Add to additional frames
              additionalFrames.push({
                index: groupIndex,
                lines: group.map(p => p.line),
                group_image_prompt: groupImagePrompt,
                group_video_prompt: groupVideoPrompt
              });

              if (options.emitLog && options.requestId) {
                options.emitLog(`✅ Generated group ${groupIndex + 1} with image and video prompts`, options.requestId);
              }
            }
            
            if (options.emitLog && options.requestId) {
              options.emitLog(`✅ Successfully generated ${additionalFrames.length} group frames`, options.requestId);
            }
          } catch (e) {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Error generating group frames: ${e instanceof Error ? e.message : String(e)}. Continuing without them...`, options.requestId);
            }
          }
        }

        const songResult: SongWithAnimalsOutput = {
          global_style: globalStyle,
          prompts,
          video_prompts: videoPrompts,
          titles,
          additional_frames: additionalFrames.length > 0 ? additionalFrames : undefined,
          requests: requests.length > 0 ? requests : undefined
        };
        results.push(songResult);

        // Логируем финальный globalStyle для отладки
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎨 Final globalStyle used: ${globalStyle.substring(0, 100)}...`, options.requestId);
        }

        // Save to file in unprocessed folder
        if (options.emitLog && options.requestId) {
          options.emitLog(`💾 Saving result...`, options.requestId);
        }
        const generationsDir = getGenerationsDir();
        if (generationsDir) {
          const unprocessedDir = path.join(generationsDir, 'unprocessed');
          await fs.mkdir(unprocessedDir, { recursive: true });
          const fileNumber = await getNextFileNumber(generationsDir);
          const filename = `${fileNumber}-${selectedStyle}.json`;
          const filePath = path.join(unprocessedDir, filename);
          await fs.writeFile(filePath, JSON.stringify(songResult, null, 2), 'utf-8');
        }
        if (options.emitLog && options.requestId) {
          options.emitLog(`✅ Generation finished with ${selectedStyle} style`, options.requestId);
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