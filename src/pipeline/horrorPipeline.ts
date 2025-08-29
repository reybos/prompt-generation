import { HorrorInput, HorrorOutput, HorrorImagePrompt, HorrorVideoPrompt } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { horrorImagePrompt } from '../promts/horror/imagePrompt.js';
import { horrorVideoPrompt, horrorTitleDescPrompt, horrorHashtagsPrompt, logVideoPrompt, logTitleDescPrompt } from '../promts/index.js';
import { createChain } from '../chains/index.js';
import { executePipelineStep, safeJsonParse } from '../utils/index.js';
import fs from 'fs/promises';
import path from 'path';
import { getGenerationsDir } from '../server.js';
import { getNextFileNumber } from '../utils/fileUtils.js';

/**
 * Run the complete horror generation pipeline (including titles, descriptions and hashtags)
 * @param input - The horror input (array of animal objects with descriptions)
 * @param options - Pipeline options
 * @returns The generated horror outputs (one per animal)
 */
export async function runHorrorPipeline(
  input: HorrorInput,
  options: PipelineOptions = {}
): Promise<HorrorOutput[]> {
  const results: HorrorOutput[] = [];

  for (const animal of input) {
    const animalDescription = animal.animal;

    // Set models and temperatures for each step
    // const imageModel = 'anthropic/claude-3.7-sonnet';
    const imageModel = 'openai/gpt-5-chat';
    const imageTemperature = 0.4;
    const videoModel = 'openai/gpt-5-chat';
    const videoTemperature = 0.7;
    const titleDescModel = 'openai/gpt-5-chat';
    const titleDescTemperature = 0.7;
    const hashtagsModel = 'openai/gpt-5-chat';
    const hashtagsTemperature = 0.4;

    let attempt = 0;
    const maxAttempts = 3;
    let finished = false;
    while (attempt < maxAttempts && !finished) {
      attempt++;
      try {
        if (options.emitLog && options.requestId) {
          options.emitLog(`👻 Generating horror animal content... (Attempt ${attempt})`, options.requestId);
        }

        // Step 1: Generate image prompts
        if (options.emitLog && options.requestId) {
          options.emitLog(`🖼️ Generating image prompts for animal: ${animalDescription.substring(0, 50)}...`, options.requestId);
        }
        
        // Создаем промт для изображений
        const imageChain = createChain(horrorImagePrompt, { model: imageModel, temperature: imageTemperature });
        
        const imageJson: string | Record<string, any> | null = await executePipelineStep(
          'HORROR IMAGE PROMPTS',
          imageChain,
          { animalDescription: animalDescription }
        );
        let prompt: HorrorImagePrompt | null = null;
        if (imageJson) {
          const parsed = typeof imageJson === 'string' ? safeJsonParse(imageJson, 'HORROR IMAGE PROMPTS') : imageJson;
          if (parsed && typeof parsed === 'object') {
            if (parsed.prompt) {
              prompt = {
                line: animalDescription,
                prompt: parsed.prompt,
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
        let videoPrompt: HorrorVideoPrompt | null = null;
        let videoJson: string | Record<string, any> | null = null;
        try {
          const videoChain = createChain(horrorVideoPrompt, { model: videoModel, temperature: videoTemperature });
          
          // Prepare image prompt as formatted string for the prompt
          const imagePromptFormatted = `Line: "${prompt.line}"\nPrompt: ${prompt.prompt}`;
          
          // Логируем видео промт в консоль
          logVideoPrompt('', imagePromptFormatted);
          
          videoJson = await executePipelineStep(
            'HORROR VIDEO PROMPTS',
            videoChain,
            { 
              image_prompts: imagePromptFormatted
            }
          );
          if (videoJson) {
            const parsed = typeof videoJson === 'string' ? safeJsonParse(videoJson, 'HORROR VIDEO PROMPTS') : videoJson;
            if (options.emitLog && options.requestId) {
              options.emitLog(`🔍 Video prompt parsing: ${JSON.stringify(parsed).substring(0, 200)}...`, options.requestId);
            }
            if (parsed && typeof parsed === 'object' && parsed.video_prompt) {
              videoPrompt = {
                line: animalDescription,
                video_prompt: parsed.video_prompt,
                index: 0
              };
              if (options.emitLog && options.requestId) {
                options.emitLog(`✅ Successfully parsed video prompt`, options.requestId);
              }
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`⚠️ Video prompt parsing issue: parsed.video_prompt is missing`, options.requestId);
              }
            }
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to generate video prompt. Retrying...`, options.requestId);
            }
            break; // Retry the whole animal
          }
        } catch (e) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Error generating video prompt: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
          }
          break; // Retry the whole animal
        }

        if (!videoPrompt) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ No video prompt generated. Retrying...`, options.requestId);
          }
          break;
        }

        // Step 3: Generate title, description and hashtags for the animal
        if (options.emitLog && options.requestId) {
          options.emitLog(`🏷️ Generating title, description and hashtags for animal...`, options.requestId);
        }

        // Get animal line and video prompt
        const animalLine = prompt.line;
        const animalVideoPrompt = videoPrompt.video_prompt;
        
        let title = '';
        let description = '';
        let titleDescJson: string | Record<string, any> | null = null;
        try {
          const titleDescChain = createChain(horrorTitleDescPrompt, { model: titleDescModel, temperature: titleDescTemperature });
          
          // Логируем title/description промт в консоль
          logTitleDescPrompt(animalLine, animalVideoPrompt, '');
          
          titleDescJson = await executePipelineStep(
            'HORROR TITLE & DESCRIPTION',
            titleDescChain,
            { 
              animalDescription: animalLine,
              videoPrompt: animalVideoPrompt
            }
          );
          if (titleDescJson) {
            const parsed = typeof titleDescJson === 'string' ? safeJsonParse(titleDescJson, 'HORROR TITLE & DESCRIPTION') : titleDescJson;
            if (parsed && typeof parsed === 'object') {
              title = parsed.title || '';
              description = parsed.description || '';
            }
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to generate title/description for animal. Retrying...`, options.requestId);
            }
            break; // Retry the whole animal
          }
        } catch (e) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Error generating title/description for animal: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
          }
          break; // Retry the whole animal
        }

        // Generate hashtags for the animal
        if (options.emitLog && options.requestId) {
          options.emitLog(`#️⃣ Generating hashtags for animal...`, options.requestId);
        }
        
        let hashtagsStr: string | null = null;
        try {
          const hashtagsChain = createChain(horrorHashtagsPrompt, { model: hashtagsModel, temperature: hashtagsTemperature });
          hashtagsStr = await executePipelineStep(
            'HORROR HASHTAGS',
            hashtagsChain,
            { 
              animalDescription: animalLine,
              videoPrompt: animalVideoPrompt
            },
            false // Don't parse as JSON, hashtags are returned as plain string
          );
          if (hashtagsStr && typeof hashtagsStr === 'string') {
            hashtagsStr = hashtagsStr.trim();
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to generate hashtags for animal. Retrying...`, options.requestId);
            }
            break; // Retry the whole animal
          }
        } catch (e) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Error generating hashtags for animal: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
          }
          break; // Retry the whole animal
        }

        const animalResult: HorrorOutput = {
          animal: animalDescription,
          prompt: prompt,
          video_prompt: videoPrompt,
          title: title,
          description: description,
          hashtags: hashtagsStr
        };
        results.push(animalResult);
        
        if (options.emitLog && options.requestId) {
          options.emitLog(`✅ Horror animal generation finished`, options.requestId);
        }
        finished = true;
      } catch (error) {
        if (options.emitLog && options.requestId) {
          options.emitLog(`❌ Error generating horror: ${error instanceof Error ? error.message : String(error)}`, options.requestId);
        }
        if (attempt >= maxAttempts) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`🚫 Failed to generate horror after ${maxAttempts} attempts. Skipping.`, options.requestId);
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
        const filename = `${fileNumber}-horror-all.json`;
        const filePath = path.join(unprocessedDir, filename);
        
        // Save all results as one array
        await fs.writeFile(filePath, JSON.stringify(results, null, 2), 'utf-8');
        
        if (options.emitLog && options.requestId) {
          options.emitLog(`💾 Saved all ${results.length} horror animal results to ${filename}`, options.requestId);
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
