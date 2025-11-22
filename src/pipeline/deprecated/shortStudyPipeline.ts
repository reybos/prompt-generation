import { ShortStudyInput, ShortStudyOutput, ShortStudyVideoPrompt, ShortStudySongPrompt, LLMRequest } from '../../types/pipeline.js';
import { PipelineOptions } from '../../types/pipeline.js';
import { shortStudyVideoPrompt, shortStudyTitleDescPrompt, shortStudyHashtagsPrompt, shortStudySongPrompt, shortStudyLogTitleDescPrompt } from '../../promts/index.js';
import { executePipelineStepWithTracking, safeJsonParse } from '../../utils/index.js';
import fs from 'fs/promises';
import path from 'path';
import { getGenerationsDir } from '../../config/index.js';
import { getNextFileNumber } from '../../utils/index.js';

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
    const songModel = 'openai/gpt-5-chat';
    const songTemperature = 0.6;
    const videoModel = 'openai/gpt-5-chat';
    const videoTemperature = 0;
    const titleDescModel = 'openai/gpt-5-chat';
    const titleDescTemperature = 0.7;
    const hashtagsModel = 'openai/gpt-5-chat';
    const hashtagsTemperature = 0.4;

    let attempt = 0;
    const maxAttempts = 3;
    let finished = false;
    while (attempt < maxAttempts && !finished) {
      attempt++;
      const requests: LLMRequest[] = [];
      try {
        if (options.emitLog && options.requestId) {
          options.emitLog(`📚 Generating short study content... (Attempt ${attempt})`, options.requestId);
        }

        // Step 1: Generate song
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎵 Generating song for topic: ${topicDescription.substring(0, 50)}...`, options.requestId);
        }
        
        let songPrompt: ShortStudySongPrompt | null = null;
        try {
          const songJson: string | Record<string, any> | null = await executePipelineStepWithTracking({
            stepName: 'SHORT STUDY SONG',
            promptTemplate: shortStudySongPrompt,
            options: { model: songModel, temperature: songTemperature },
            params: { topicDescription: topicDescription },
            requests
          });
          
          if (songJson) {
            const parsed = typeof songJson === 'string' ? safeJsonParse(songJson, 'SHORT STUDY SONG') : songJson;
            if (parsed && typeof parsed === 'object' && parsed.song_text && parsed.music_prompt) {
              songPrompt = {
                song_text: parsed.song_text,
                music_prompt: parsed.music_prompt
              };
              if (options.emitLog && options.requestId) {
                options.emitLog(`✅ Successfully generated song`, options.requestId);
              }
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`⚠️ Song generation parsing issue: missing song_text or music_prompt`, options.requestId);
              }
            }
          } else {
            if (options.emitLog && options.requestId) {
              options.emitLog(`❌ Failed to generate song. Retrying...`, options.requestId);
            }
            break;
          }
        } catch (e) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ Error generating song: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
          }
          break;
        }

        if (!songPrompt) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`❌ No song generated. Retrying...`, options.requestId);
          }
          break;
        }

        // Step 2: Generate video prompt
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎬 Generating video prompt based on song...`, options.requestId);
        }
        let videoPrompt: ShortStudyVideoPrompt | null = null;
        let videoJson: string | Record<string, any> | null = null;
        try {
          // Логируем видео промт в консоль
          // Log video prompt (removed logVideoPrompt function)
          console.log('Video prompt:', songPrompt.song_text, 'Topic:', topicDescription);
          
          videoJson = await executePipelineStepWithTracking({
            stepName: 'SHORT STUDY VIDEO PROMPTS',
            promptTemplate: shortStudyVideoPrompt,
            options: { model: videoModel, temperature: videoTemperature },
            params: { 
              song_text: songPrompt.song_text,
              topic_description: topicDescription
            },
            requests
          });
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

        // Check video prompt length and retry if too long
        if (videoPrompt.video_prompt && videoPrompt.video_prompt.length > 2000) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`⚠️ Video prompt too long (${videoPrompt.video_prompt.length} chars). Retrying...`, options.requestId);
          }
          break; // Retry the whole topic
        }

        // Step 3: Generate title, description and hashtags for the topic
        if (options.emitLog && options.requestId) {
          options.emitLog(`🏷️ Generating title, description and hashtags for topic...`, options.requestId);
        }

        // Get topic line and song text
        const topicLine = topicDescription;
        const songText = songPrompt.song_text;
        
        let title = '';
        let description = '';
        let titleDescJson: string | Record<string, any> | null = null;
        try {
          // Логируем title/description промт в консоль
          shortStudyLogTitleDescPrompt(topicLine, songText);
          
          titleDescJson = await executePipelineStepWithTracking({
            stepName: 'SHORT STUDY TITLE & DESCRIPTION',
            promptTemplate: shortStudyTitleDescPrompt,
            options: { model: titleDescModel, temperature: titleDescTemperature },
            params: { 
              topicDescription: topicLine,
              song_text: songText
            },
            requests
          });
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
          hashtagsStr = await executePipelineStepWithTracking({
            stepName: 'SHORT STUDY HASHTAGS',
            promptTemplate: shortStudyHashtagsPrompt,
            options: { model: hashtagsModel, temperature: hashtagsTemperature },
            params: { 
              topicDescription: topicLine,
              song_text: songText
            },
            requests,
            parseJson: false // Don't parse as JSON, hashtags are returned as plain string
          }) as string | null;
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
          song: songPrompt,
          video_prompt: videoPrompt,
          title: title,
          description: description,
          hashtags: hashtagsStr,
          requests: requests.length > 0 ? requests : undefined
        };
        results.push(topicResult);

        // Save to file in unprocessed folder
        if (options.emitLog && options.requestId) {
          options.emitLog(`💾 Saving result...`, options.requestId);
        }
        const generationsDir = getGenerationsDir();
        if (generationsDir) {
          const unprocessedDir = path.join(generationsDir, 'unprocessed');
          await fs.mkdir(unprocessedDir, { recursive: true });
          const fileNumber = await getNextFileNumber(generationsDir);
          const filename = `${fileNumber}-short-study.json`;
          const filePath = path.join(unprocessedDir, filename);
          await fs.writeFile(filePath, JSON.stringify(topicResult, null, 2), 'utf-8');
        }
        
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



  return results;
}
