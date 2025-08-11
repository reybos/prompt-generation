import { SongWithAnimalsInput, SongWithAnimalsOutput, SongWithAnimalsImagePrompt, SongWithAnimalsVideoPrompt } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { imagePrompt, songWithAnimalsTitleDescPrompt, songWithAnimalsHashtagsPrompt, songWithAnimalsVideoPrompt } from '../promts/index.js';
import { createChain } from '../chains/index.js';
import { executePipelineStep, safeJsonParse } from '../utils/index.js';
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
 * Run the song with animals generation pipeline for multiple songs
 * @param input - The song with animals input (array of song objects with lyrics)
 * @param options - Pipeline options
 * @returns The generated song with animals outputs (one per song)
 */
export async function runSongWithAnimalsPipeline(
  input: SongWithAnimalsInput,
  options: PipelineOptions = {}
): Promise<SongWithAnimalsOutput[]> {
  const results: SongWithAnimalsOutput[] = [];

  for (const song of input) {
    const lyrics = song.lyrics;
    const segments = splitLyricsIntoSegments(lyrics);

    // Set models and temperatures for each step
    const imageModel = 'anthropic/claude-3.7-sonnet';
    const imageTemperature = 0.3;
    const titleDescModel = 'anthropic/claude-3.7-sonnet';
    const titleDescTemperature = 0.7;
    const hashtagsModel = 'anthropic/claude-3.7-sonnet';
    const hashtagsTemperature = 0.4;
    const videoModel = 'anthropic/claude-3.7-sonnet';
    const videoTemperature = 0.5;

    let attempt = 0;
    const maxAttempts = 3;
    let finished = false;
    while (attempt < maxAttempts && !finished) {
      attempt++;
      try {
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎵 Generating song with animals... (Attempt ${attempt})`, options.requestId);
        }

        // Step 1: Generate image prompts
        if (options.emitLog && options.requestId) {
          options.emitLog(`🖼️ Generating image prompts...`, options.requestId);
        }
        const imageChain = createChain(imagePrompt, { model: imageModel, temperature: imageTemperature });
        const imageJson: string | Record<string, any> | null = await executePipelineStep(
          'SONG WITH ANIMALS IMAGE PROMPTS',
          imageChain,
          { songLyrics: lyrics }
        );
        let globalStyle = '';
        let prompts: SongWithAnimalsImagePrompt[] = [];
        if (imageJson) {
          const parsed = typeof imageJson === 'string' ? safeJsonParse(imageJson, 'SONG WITH ANIMALS IMAGE PROMPTS') : imageJson;
          if (parsed && typeof parsed === 'object') {
            globalStyle = parsed.global_style || '';
            prompts = Array.isArray(parsed.prompts) ? parsed.prompts : [];
          }
        } else {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Failed to generate image prompts. Retrying...`, options.requestId);
          }
          break;
        }

        // Step 2: Generate title & description for each segment
        if (options.emitLog && options.requestId) {
          options.emitLog(`🏷️ Generating titles and descriptions for ${segments.length} segments...`, options.requestId);
        }
        const titles: string[] = [];
        const descriptions: string[] = [];
        
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          if (options.emitLog && options.requestId) {
            options.emitLog(`🏷️ Generating title/description for segment ${i + 1}/${segments.length}...`, options.requestId);
          }
          
          let title = '';
          let description = '';
          let titleDescJson: string | Record<string, any> | null = null;
          try {
            const titleDescChain = createChain(songWithAnimalsTitleDescPrompt, { model: titleDescModel, temperature: titleDescTemperature });
            titleDescJson = await executePipelineStep(
              'SONG WITH ANIMALS TITLE & DESCRIPTION',
              titleDescChain,
              { songLyrics: segment }
            );
            if (titleDescJson) {
              const parsed = typeof titleDescJson === 'string' ? safeJsonParse(titleDescJson, 'SONG WITH ANIMALS TITLE & DESCRIPTION') : titleDescJson;
              if (parsed && typeof parsed === 'object') {
                title = parsed.title || '';
                description = parsed.description || '';
              }
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`❌ Failed to generate title/description for segment ${i + 1}. Retrying...`, options.requestId);
              }
              break; // Retry the whole song
            }
          } catch (e) {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Error generating title/description for segment ${i + 1}: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
            }
            break; // Retry the whole song
          }
          
          titles.push(title);
          descriptions.push(description);
        }

        // Step 3: Generate hashtags for each segment
        if (options.emitLog && options.requestId) {
          options.emitLog(`#️⃣ Generating hashtags for ${segments.length} segments...`, options.requestId);
        }
        const hashtagsArray: string[] = [];
        
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          if (options.emitLog && options.requestId) {
            options.emitLog(`#️⃣ Generating hashtags for segment ${i + 1}/${segments.length}...`, options.requestId);
          }
          
          let hashtags = '';
          let hashtagsStr: string | null = null;
          try {
            const hashtagsChain = createChain(songWithAnimalsHashtagsPrompt, { model: hashtagsModel, temperature: hashtagsTemperature });
            hashtagsStr = await executePipelineStep(
              'SONG WITH ANIMALS HASHTAGS',
              hashtagsChain,
              { songLyrics: segment },
              false // Don't parse as JSON, hashtags are returned as plain string
            );
            if (hashtagsStr && typeof hashtagsStr === 'string') {
              hashtags = hashtagsStr.trim();
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`❌ Failed to generate hashtags for segment ${i + 1}. Retrying...`, options.requestId);
              }
              break; // Retry the whole song
            }
          } catch (e) {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Error generating hashtags for segment ${i + 1}: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
            }
            break; // Retry the whole song
          }
          
          hashtagsArray.push(hashtags);
        }

        // Step 4: Generate video prompts
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎬 Generating video prompts...`, options.requestId);
        }
        let videoPrompts: SongWithAnimalsVideoPrompt[] = [];
        let videoJson: string | Record<string, any> | null = null;
        try {
          const videoChain = createChain(songWithAnimalsVideoPrompt, { model: videoModel, temperature: videoTemperature });
          
          // Prepare image prompts as formatted string for the prompt
          const imagePromptsFormatted = prompts.map(p => `Line: "${p.line}"\nPrompt: ${p.prompt}`).join('\n\n');
          
          videoJson = await executePipelineStep(
            'SONG WITH ANIMALS VIDEO PROMPTS',
            videoChain,
            { 
              global_style: globalStyle,
              image_prompts: imagePromptsFormatted
            }
          );
          if (videoJson) {
            const parsed = typeof videoJson === 'string' ? safeJsonParse(videoJson, 'SONG WITH ANIMALS VIDEO PROMPTS') : videoJson;
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.video_prompts)) {
              videoPrompts = parsed.video_prompts;
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

        const songResult: SongWithAnimalsOutput = {
          global_style: globalStyle,
          prompts,
          video_prompts: videoPrompts,
          titles: titles,
          descriptions: descriptions,
          hashtags: hashtagsArray
        };
        results.push(songResult);

        // Save to file in unprocessed folder
        if (options.emitLog && options.requestId) {
          options.emitLog(`💾 Saving result...`, options.requestId);
        }
        const generationsDir = getGenerationsDir();
        if (generationsDir) {
          const unprocessedDir = path.join(generationsDir, 'unprocessed');
          await fs.mkdir(unprocessedDir, { recursive: true });
          const fileNumber = await getNextFileNumber(generationsDir);
          const filename = `${fileNumber}-song_with_animals.json`;
          const filePath = path.join(unprocessedDir, filename);
          await fs.writeFile(filePath, JSON.stringify(songResult, null, 2), 'utf-8');
        }
        if (options.emitLog && options.requestId) {
          options.emitLog(`✅ Generation finished`, options.requestId);
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