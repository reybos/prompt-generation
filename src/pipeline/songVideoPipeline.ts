import { SongVideoInput, SongVideoOutput, SongVideoScene } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { songMediaPrompt, songEnhanceMediaPrompt, songShortenPrompt } from '../promts/index.js';
import { songTitleDescPrompt, songHashtagsPrompt } from '../promts/index.js';
import { createChain } from '../chains/index.js';
import { executePipelineStep, safeJsonParse } from '../utils/index.js';
import { PromptTemplate } from '@langchain/core/prompts';
import fs from 'fs/promises';
import path from 'path';
import { getGenerationsDir } from '../server.js';
import { getNextFileNumber } from '../utils/fileUtils.js';

/**
 * Run the song video generation pipeline for multiple songs
 * @param input - The song video input (array of arrays of segments)
 * @param options - Pipeline options
 * @returns The generated song video outputs (one per song)
 */
export async function runSongVideoPipeline(
  input: SongVideoInput,
  options: PipelineOptions = {}
): Promise<SongVideoOutput[]> {
  const results: SongVideoOutput[] = [];

  for (const song of input) {
    const topic = song.topic;
    const songSegments = song.segments;
    const timings = songSegments; // Pass the raw array, not JSON string

    // Set models and temperatures for each step here (as in contentPipeline)
    const mediaModel = 'anthropic/claude-3.7-sonnet';
    const mediaTemperature = 0.3;
    const enhanceMediaModel = 'anthropic/claude-3.7-sonnet';
    const enhanceMediaTemperature = 0.3;
    const shortenModel = 'anthropic/claude-3.7-sonnet';
    const shortenTemperature = 0.1;
    const titleDescModel = 'anthropic/claude-3.7-sonnet';
    const titleDescTemperature = 0.6;
    const hashtagsModel = 'anthropic/claude-3.7-sonnet';
    const hashtagsTemperature = 0.4;

    let attempt = 0;
    const maxAttempts = 3;
    let finished = false;
    while (attempt < maxAttempts && !finished) {
      attempt++;
      try {
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎵 Generating song video for "${topic}"... (Attempt ${attempt})`, options.requestId);
        }

        // Step 1: Generate media prompts
        if (options.emitLog && options.requestId) {
          options.emitLog(`🖼️ Generating media prompts for "${topic}"...`, options.requestId);
        }
        const promptTemplate = new PromptTemplate({
          template: songMediaPrompt,
          inputVariables: ['topic', 'timings'],
        });
        const mediaChain = createChain(promptTemplate, { model: mediaModel, temperature: mediaTemperature });
        const mediaJson: string | Record<string, any> | null = await executePipelineStep(
          'SONG MEDIA PROMPTS',
          mediaChain,
          { topic, timings }
        );
        let scenes: SongVideoScene[] = [];
        if (mediaJson) {
          const parsed = typeof mediaJson === 'string' ? safeJsonParse(mediaJson, 'SONG MEDIA PROMPTS') : mediaJson;
          if (Array.isArray(parsed)) {
            scenes = parsed;
          }
        } else {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Failed to generate media prompts for "${topic}". Retrying...`, options.requestId);
          }
          break;
        }

        // Step 2: Enhance media prompts
        if (options.emitLog && options.requestId) {
          options.emitLog(`✨ Enhancing media prompts for "${topic}"...`, options.requestId);
        }
        let enhancedMedia: SongVideoScene[] = [];
        if (scenes.length > 0) {
          const enhancePromptTemplate = new PromptTemplate({
            template: songEnhanceMediaPrompt,
            inputVariables: ['topic', 'timings', 'media_prompts'],
          });
          const enhanceMediaChain = createChain(enhancePromptTemplate, { model: enhanceMediaModel, temperature: enhanceMediaTemperature });
          const enhanceJson: string | Record<string, any> | null = await executePipelineStep(
            'SONG ENHANCE MEDIA PROMPTS',
            enhanceMediaChain,
            { topic, timings, media_prompts: JSON.stringify(scenes, null, 2) }
          );
          if (enhanceJson) {
            const parsed = typeof enhanceJson === 'string' ? safeJsonParse(enhanceJson, 'SONG ENHANCE MEDIA PROMPTS') : enhanceJson;
            if (Array.isArray(parsed)) {
              enhancedMedia = parsed;
            }
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to enhance media prompts for "${topic}". Retrying...`, options.requestId);
            }
            break;
          }
        } else {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Failed to enhance media prompts for "${topic}". Retrying...`, options.requestId);
          }
          break;
        }

        // Step 3: Reduce prompts if too long (retry per prompt)
        if (options.emitLog && options.requestId) {
          options.emitLog(`✂️ Reducing long prompts for "${topic}"...`, options.requestId);
        }
        const shortenPromptTemplate = new PromptTemplate({
          template: songShortenPrompt,
          inputVariables: ['prompt'],
        });
        const shortenChain = createChain(shortenPromptTemplate, { model: shortenModel, temperature: shortenTemperature });
        let shorteningFailed = false;
        for (const scene of enhancedMedia) {
          // image_prompt (scene 0 only)
          if (scene.image_prompt && scene.image_prompt.length > 1500) {
            let shortened = scene.image_prompt;
            let shortenAttempts = 0;
            while (shortened.length > 1500 && shortenAttempts < 3) {
              const result = await executePipelineStep(
                'SONG SHORTEN IMAGE PROMPT',
                shortenChain,
                { prompt: shortened },
                false // Don't parse as JSON, shortened prompt is returned as plain string
              );
              if (result && typeof result === 'string') {
                shortened = result;
              } else {
                break;
              }
              shortenAttempts++;
            }
            if (shortened.length > 1500) {
              shorteningFailed = true;
              break;
            }
            scene.image_prompt = shortened;
          }
          // video_prompt
          if (scene.video_prompt && scene.video_prompt.length > 1500) {
            let shortened = scene.video_prompt;
            let shortenAttempts = 0;
            while (shortened.length > 1500 && shortenAttempts < 3) {
              const result = await executePipelineStep(
                'SONG SHORTEN VIDEO PROMPT',
                shortenChain,
                { prompt: shortened },
                false // Don't parse as JSON, shortened prompt is returned as plain string
              );
              if (result && typeof result === 'string') {
                shortened = result;
              } else {
                break;
              }
              shortenAttempts++;
            }
            if (shortened.length > 1500) {
              shorteningFailed = true;
              break;
            }
            scene.video_prompt = shortened;
          }
        }
        if (shorteningFailed) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Failed to reduce long prompts for "${topic}". Retrying...`, options.requestId);
          }
          continue; // Retry the whole song from the beginning
        }

        // Step 4: Generate title & description
        if (options.emitLog && options.requestId) {
          options.emitLog(`🏷️ Generating title and description for "${topic}"...`, options.requestId);
        }
        let title = '';
        let description = '';
        const script = enhancedMedia.map(s => s.video_prompt).join('\n');
        let titleDescJson: string | Record<string, any> | null = null;
        try {
          const titleDescPromptTemplate = new PromptTemplate({
            template: songTitleDescPrompt,
            inputVariables: ['topic', 'script'],
          });
          const titleDescChain = createChain(titleDescPromptTemplate, { model: titleDescModel, temperature: titleDescTemperature });
          titleDescJson = await executePipelineStep(
            'SONG TITLE & DESCRIPTION',
            titleDescChain,
            { topic, script }
          );
          if (titleDescJson) {
            const parsed = typeof titleDescJson === 'string' ? safeJsonParse(titleDescJson, 'SONG TITLE & DESCRIPTION') : titleDescJson;
            if (parsed && typeof parsed === 'object') {
              title = parsed.title || '';
              description = parsed.description || '';
            }
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to generate title/description for "${topic}". Retrying...`, options.requestId);
            }
            break; // Retry the whole song
          }
        } catch (e) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Error generating title/description for "${topic}": ${e instanceof Error ? e.message : String(e)}`, options.requestId);
          }
          break; // Retry the whole song
        }

        // Step 5: Generate hashtags
        if (options.emitLog && options.requestId) {
          options.emitLog(`#️⃣ Generating hashtags for "${topic}"...`, options.requestId);
        }
        let hashtags = '';
        const channel = options.channelName || 'minimarvels';
        let hashtagsStr: string | null = null;
        try {
          const hashtagsPromptTemplate = new PromptTemplate({
            template: songHashtagsPrompt,
            inputVariables: ['topic', 'script', 'channel'],
          });
          const hashtagsChain = createChain(hashtagsPromptTemplate, { model: hashtagsModel, temperature: hashtagsTemperature });
          hashtagsStr = await executePipelineStep(
            'SONG HASHTAGS',
            hashtagsChain,
            { topic, script, channel },
            false // Don't parse as JSON, hashtags are returned as plain string
          );
          if (hashtagsStr && typeof hashtagsStr === 'string') {
            hashtags = hashtagsStr.trim();
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to generate hashtags for "${topic}". Retrying...`, options.requestId);
            }
            break; // Retry the whole song
          }
        } catch (e) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Error generating hashtags for "${topic}": ${e instanceof Error ? e.message : String(e)}`, options.requestId);
          }
          break; // Retry the whole song
        }

        const songResult: SongVideoOutput = {
          scenes,
          enhancedMedia,
          title,
          description,
          hashtags
        };
        results.push(songResult);

        // Save to file in unprocessed folder (same as contentPipeline)
        if (options.emitLog && options.requestId) {
          options.emitLog(`💾 Saving result for "${topic}"...`, options.requestId);
        }
        const generationsDir = getGenerationsDir();
        if (generationsDir) {
          const unprocessedDir = path.join(generationsDir, 'unprocessed');
          await fs.mkdir(unprocessedDir, { recursive: true });
          let safeTopic = topic.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
          safeTopic = safeTopic.replace(/^_+|_+$/g, '');
          const fileNumber = await getNextFileNumber(generationsDir);
          const filename = `${fileNumber}-${safeTopic}.json`;
          const cleanedFilename = filename.replace(/-+\.json$/, '.json');
          const filePath = path.join(unprocessedDir, cleanedFilename);
          await fs.writeFile(filePath, JSON.stringify(songResult, null, 2), 'utf-8');
        }
        if (options.emitLog && options.requestId) {
          options.emitLog(`✅ Generation finished for "${topic}"`, options.requestId);
        }
        finished = true;
      } catch (error) {
        if (options.emitLog && options.requestId) {
          options.emitLog(`❌ Error generating song for "${topic}": ${error instanceof Error ? error.message : String(error)}`, options.requestId);
        }
        if (attempt >= maxAttempts) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`🚫 Failed to generate song for "${topic}" after ${maxAttempts} attempts. Skipping.`, options.requestId);
          }
        }
      }
    }
  }

  return results;
}