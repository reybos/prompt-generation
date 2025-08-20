import { ShortStudyInput, ShortStudyOutput, ShortStudyImagePrompt, ShortStudyVideoPrompt } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { shortStudyImagePrompt } from '../promts/short_study/imagePrompt.js';
import { shortStudyVideoPrompt, shortStudyTitleDescPrompt, shortStudyHashtagsPrompt, logVideoPrompt, logTitleDescPrompt } from '../promts/index.js';
import { createChain } from '../chains/index.js';
import { executePipelineStep, safeJsonParse } from '../utils/index.js';
import fs from 'fs/promises';
import path from 'path';
import { getGenerationsDir } from '../server.js';
import { getNextFileNumber } from '../utils/fileUtils.js';

/**
 * Run the complete short study generation pipeline (including titles, descriptions and hashtags)
 * @param input - The short study input (array of study topics with descriptions)
 * @param options - Pipeline options
 * @returns The generated short study outputs (one per topic)
 */
export async function runShortStudyPipeline(
  input: ShortStudyInput,
  options: PipelineOptions = {}
): Promise<ShortStudyOutput[]> {
  const results: ShortStudyOutput[] = [];

  for (const topic of input) {
    const topicDescription = topic.topic;

    // Set models and temperatures for each step
    const imageModel = 'anthropic/claude-3.7-sonnet';
    const imageTemperature = 0.3;
    const videoModel = 'anthropic/claude-3.7-sonnet';
    const videoTemperature = 0.5;
    const titleDescModel = 'anthropic/claude-3.7-sonnet';
    const titleDescTemperature = 0.7;
    const hashtagsModel = 'anthropic/claude-3.7-sonnet';
    const hashtagsTemperature = 0.4;

    let attempt = 0;
    const maxAttempts = 3;
    let finished = false;
    while (attempt < maxAttempts && !finished) {
      attempt++;
      try {
        if (options.emitLog && options.requestId) {
          options.emitLog(`📚 Generating short study content... (Attempt ${attempt})`, options.requestId);
        }

        // Step 1: Generate image prompts
        if (options.emitLog && options.requestId) {
          options.emitLog(`🖼️ Generating image prompts for topic: ${topicDescription.substring(0, 50)}...`, options.requestId);
        }
        
        // Создаем промт для изображений
        const imageChain = createChain(shortStudyImagePrompt, { model: imageModel, temperature: imageTemperature });
        
        const imageJson: string | Record<string, any> | null = await executePipelineStep(
          'SHORT STUDY IMAGE PROMPTS',
          imageChain,
          { topicDescription: topicDescription }
        );
        let prompt: ShortStudyImagePrompt | null = null;
        if (imageJson) {
          const parsed = typeof imageJson === 'string' ? safeJsonParse(imageJson, 'SHORT STUDY IMAGE PROMPTS') : imageJson;
          if (parsed && typeof parsed === 'object') {
            const rawPrompts = Array.isArray(parsed.prompts) ? parsed.prompts : [];
            if (rawPrompts.length > 0) {
              // Take the first (and only) prompt for the topic
              prompt = {
                ...rawPrompts[0],
                index: 0
              };
            }
          }
        } else {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Failed to generate image prompt. Retrying...`, options.requestId);
          }
          break;
        }

        if (!prompt) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ No image prompt generated. Retrying...`, options.requestId);
          }
          break;
        }

        // Step 2: Generate video prompt
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎬 Generating video prompt for image prompt...`, options.requestId);
        }
        let videoPrompt: ShortStudyVideoPrompt | null = null;
        let videoJson: string | Record<string, any> | null = null;
        try {
          const videoChain = createChain(shortStudyVideoPrompt, { model: videoModel, temperature: videoTemperature });
          
          // Prepare image prompt as formatted string for the prompt
          const imagePromptFormatted = `Line: "${prompt.line}"\nPrompt: ${prompt.prompt}`;
          
          // Логируем видео промт в консоль
          logVideoPrompt('', imagePromptFormatted);
          
          videoJson = await executePipelineStep(
            'SHORT STUDY VIDEO PROMPTS',
            videoChain,
            { 
              image_prompts: imagePromptFormatted
            }
          );
          if (videoJson) {
            const parsed = typeof videoJson === 'string' ? safeJsonParse(videoJson, 'SHORT STUDY VIDEO PROMPTS') : videoJson;
            if (options.emitLog && options.requestId) {
              options.emitLog(`🔍 Video prompt parsing: ${JSON.stringify(parsed).substring(0, 200)}...`, options.requestId);
            }
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.video_prompts)) {
              const rawVideoPrompts = parsed.video_prompts;
              if (rawVideoPrompts.length > 0) {
                // Take the first (and only) video prompt for the topic
                videoPrompt = {
                  ...rawVideoPrompts[0],
                  index: 0
                };
                if (options.emitLog && options.requestId) {
                  options.emitLog(`✅ Successfully parsed video prompt`, options.requestId);
                }
              }
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`⚠️ Video prompt parsing issue: parsed.video_prompts is not an array`, options.requestId);
              }
            }
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to generate video prompt. Retrying...`, options.requestId);
            }
            break; // Retry the whole topic
          }
        } catch (e) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Error generating video prompt: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
          }
          break; // Retry the whole topic
        }

        if (!videoPrompt) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ No video prompt generated. Retrying...`, options.requestId);
          }
          break;
        }

        // Step 3: Generate title, description and hashtags for the topic
        if (options.emitLog && options.requestId) {
          options.emitLog(`🏷️ Generating title, description and hashtags for topic...`, options.requestId);
        }

        // Get topic line and video prompt
        const topicLine = prompt.line;
        const topicVideoPrompt = videoPrompt.video_prompt;
        
        let title = '';
        let description = '';
        let titleDescJson: string | Record<string, any> | null = null;
        try {
          const titleDescChain = createChain(shortStudyTitleDescPrompt, { model: titleDescModel, temperature: titleDescTemperature });
          
          // Логируем title/description промт в консоль
          logTitleDescPrompt(topicLine, topicVideoPrompt, '');
          
          titleDescJson = await executePipelineStep(
            'SHORT STUDY TITLE & DESCRIPTION',
            titleDescChain,
            { 
              topicDescription: topicLine,
              videoPrompt: topicVideoPrompt
            }
          );
          if (titleDescJson) {
            const parsed = typeof titleDescJson === 'string' ? safeJsonParse(titleDescJson, 'SHORT STUDY TITLE & DESCRIPTION') : titleDescJson;
            if (parsed && typeof parsed === 'object') {
              title = parsed.title || '';
              description = parsed.description || '';
            }
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to generate title/description for topic. Retrying...`, options.requestId);
            }
            break; // Retry the whole topic
          }
        } catch (e) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Error generating title/description for topic: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
          }
          break; // Retry the whole topic
        }

        // Generate hashtags for the topic
        if (options.emitLog && options.requestId) {
          options.emitLog(`#️⃣ Generating hashtags for topic...`, options.requestId);
        }
        
        let hashtagsStr: string | null = null;
        try {
          const hashtagsChain = createChain(shortStudyHashtagsPrompt, { model: hashtagsModel, temperature: hashtagsTemperature });
          hashtagsStr = await executePipelineStep(
            'SHORT STUDY HASHTAGS',
            hashtagsChain,
            { 
              topicDescription: topicLine,
              videoPrompt: topicVideoPrompt
            },
            false // Don't parse as JSON, hashtags are returned as plain string
          );
          if (hashtagsStr && typeof hashtagsStr === 'string') {
            hashtagsStr = hashtagsStr.trim();
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to generate hashtags for topic. Retrying...`, options.requestId);
            }
            break; // Retry the whole topic
          }
        } catch (e) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Error generating hashtags for topic: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
          }
          break; // Retry the whole topic
        }

        const topicResult: ShortStudyOutput = {
          global_style: '',
          prompts: [prompt],
          video_prompts: [videoPrompt],
          titles: [title],
          descriptions: [description],
          hashtags: [hashtagsStr]
        };
        results.push(topicResult);
        
        if (options.emitLog && options.requestId) {
          options.emitLog(`✅ Short study topic generation finished`, options.requestId);
        }
        finished = true;
      } catch (error) {
        if (options.emitLog && options.requestId) {
          options.emitLog(`❌ Error generating short study content: ${error instanceof Error ? error.message : String(error)}`, options.requestId);
        }
        if (attempt >= maxAttempts) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`🚫 Failed to generate short study content after ${maxAttempts} attempts. Skipping.`, options.requestId);
          }
        }
      }
    }
  }

  // Save all results to one file at the end
  if (results.length > 0) {
    try {
      const generationsDir = getGenerationsDir();
      if (generationsDir) {
        const unprocessedDir = path.join(generationsDir, 'unprocessed');
        await fs.mkdir(unprocessedDir, { recursive: true });
        const fileNumber = await getNextFileNumber(generationsDir);
        const filename = `${fileNumber}-short-study-all.json`;
        const filePath = path.join(unprocessedDir, filename);
        
        // Save all results as one array
        await fs.writeFile(filePath, JSON.stringify(results, null, 2), 'utf-8');
        
        if (options.emitLog && options.requestId) {
          options.emitLog(`💾 Saved all ${results.length} short study topic results to ${filename}`, options.requestId);
        }
      }
    } catch (error) {
      if (options.emitLog && options.requestId) {
        options.emitLog(`⚠️ Warning: Failed to save results to file: ${error instanceof Error ? error.message : String(error)}`, options.requestId);
      }
    }
  }

  return results;
}
