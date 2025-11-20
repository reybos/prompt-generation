import { HalloweenInput, HalloweenImagePrompt, HalloweenAdditionalFramePrompt, HalloweenTransformVideoPrompt, HalloweenTransformOutput, LLMRequest } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { createImagePromptWithStyle } from '../promts/halloween_transform/imagePrompt.js';
import { halloweenTransformVideoPrompt, halloweenTransformTitlePrompt, halloweenTransformLogVideoPrompt, halloweenTransformLogTitlePrompt, halloweenTransformGroupImagePrompt, halloweenTransformGroupVideoPrompt, logHalloweenTransformGroupImagePrompt, logHalloweenTransformGroupVideoPrompt } from '../promts/index.js';
import { executePipelineStepWithTracking, safeJsonParse } from '../utils/index.js';
import config from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';
import { getGenerationsDir } from '../server.js';
import { getNextFileNumber } from '../utils/fileUtils.js';

function splitLyricsIntoSegments(lyrics: string): string[] {
  const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
  const segments: string[] = [];
  const segmentLines = config.songSegmentLines;
  for (let i = 0; i < lines.length; i += segmentLines) {
    const segment = lines.slice(i, i + segmentLines).join('\n');
    if (segment.trim()) segments.push(segment);
  }
  return segments;
}

function groupVideoPromptsIntoSegments(video_prompts: HalloweenTransformVideoPrompt[]): HalloweenTransformVideoPrompt[][] {
  const segments: HalloweenTransformVideoPrompt[][] = [];
  const segmentLines = config.songSegmentLines;
  for (let i = 0; i < video_prompts.length; i += segmentLines) {
    const segment = video_prompts.slice(i, i + segmentLines);
    if (segment.length > 0) segments.push(segment);
  }
  return segments;
}

export async function runHalloweenTransformPipeline(
  input: HalloweenInput,
  options: PipelineOptions = {}
): Promise<HalloweenTransformOutput[]> {
  const results: HalloweenTransformOutput[] = [];
  const selectedStyle = 'halloweenTransform';

  for (const song of input) {
    const lyrics = song.lyrics;
    const segments = splitLyricsIntoSegments(lyrics);

    const imageModel = 'anthropic/claude-sonnet-4.5';
    const imageTemperature = 0.3;
    const videoModel = 'anthropic/claude-sonnet-4.5';
    const videoTemperature = 0.5;
    const titleModel = 'anthropic/claude-sonnet-4.5';
    const titleTemperature = 0.7;

    let attempt = 0;
    const maxAttempts = 3;
    let finished = false;
    while (attempt < maxAttempts && !finished) {
      attempt++;
      const requests: LLMRequest[] = [];
      try {
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎃 Generating Halloween Transform song with ${selectedStyle} style... (Attempt ${attempt})`, options.requestId);
        }

        if (options.emitLog && options.requestId) {
          options.emitLog(`🖼️ Generating image prompts for ${segments.length} segments using ${selectedStyle} style...`, options.requestId);
        }

        const imagePromptWithStyle = createImagePromptWithStyle(selectedStyle);
        const imageJson: string | Record<string, any> | null = await executePipelineStepWithTracking({
          stepName: 'HALLOWEEN TRANSFORM IMAGE PROMPTS',
          promptTemplate: imagePromptWithStyle,
          options: { model: imageModel, temperature: imageTemperature },
          params: { songLyrics: lyrics },
          requests
        });
        let globalStyle = '';
        let prompts: HalloweenImagePrompt[] = [];
        if (imageJson) {
          const parsed = typeof imageJson === 'string' ? safeJsonParse(imageJson, 'HALLOWEEN TRANSFORM IMAGE PROMPTS') : imageJson;
          if (parsed && typeof parsed === 'object') {
            globalStyle = parsed.global_style || '';
            const rawPrompts = Array.isArray(parsed.prompts) ? parsed.prompts : [];
            prompts = rawPrompts.map((prompt, index) => ({ ...prompt, index }));
          }
        } else {
          if (options.emitLog && options.requestId) options.emitLog(`❌ Failed to generate image prompts. Retrying...`, options.requestId);
          break;
        }

        if (options.emitLog && options.requestId) {
          options.emitLog(`🎬 Generating video prompts for ${prompts.length} image prompts...`, options.requestId);
        }
        let videoPrompts: HalloweenTransformVideoPrompt[] = [];
        let videoJson: string | Record<string, any> | null = null;
        try {
          const imagePromptsJson = JSON.stringify(prompts.map(p => ({ line: p.line, prompt: p.prompt, index: p.index })));
          halloweenTransformLogVideoPrompt(imagePromptsJson);
          videoJson = await executePipelineStepWithTracking({
            stepName: 'HALLOWEEN TRANSFORM VIDEO PROMPTS',
            promptTemplate: halloweenTransformVideoPrompt,
            options: { model: videoModel, temperature: videoTemperature },
            params: { image_prompts: imagePromptsJson },
            requests
          });
          if (videoJson) {
            const parsed = typeof videoJson === 'string' ? safeJsonParse(videoJson, 'HALLOWEEN TRANSFORM VIDEO PROMPTS') : videoJson;
            if (options.emitLog && options.requestId) {
              options.emitLog(`🔍 Video prompts parsing: ${JSON.stringify(parsed).substring(0, 200)}...`, options.requestId);
            }
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed)) {
              const rawVideoPrompts = parsed;
              videoPrompts = rawVideoPrompts.map((prompt, index) => ({
                line: prompt.line || '',
                prompt: prompt.prompt || '',
                video_prompt: prompt.video_prompt || '',
                index: prompt.index !== undefined ? prompt.index : index
              }));
              if (options.emitLog && options.requestId) options.emitLog(`✅ Successfully parsed ${videoPrompts.length} video transformation prompts`, options.requestId);
            } else {
              if (options.emitLog && options.requestId) options.emitLog(`⚠️ Video prompts parsing issue: parsed result is not an array`, options.requestId);
            }
          } else {
            if (options.emitLog && options.requestId) options.emitLog(`❌ Failed to generate video prompts. Retrying...`, options.requestId);
            break;
          }
        } catch (e) {
          if (options.emitLog && options.requestId) options.emitLog(`❌ Error generating video prompts: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
          break;
        }

        if (options.emitLog && options.requestId) options.emitLog(`🏷️ Generating titles...`, options.requestId);
        const videoSegments = groupVideoPromptsIntoSegments(videoPrompts);
        if (options.emitLog && options.requestId) options.emitLog(`📚 Grouped ${videoPrompts.length} video prompts into ${videoSegments.length} segments of ${config.songSegmentLines} lines each`, options.requestId);

        const titles: string[] = [];
        if (options.emitLog && options.requestId) options.emitLog(`🏷️ Generating titles for ${videoSegments.length} segments...`, options.requestId);
        for (let segmentIndex = 0; segmentIndex < videoSegments.length; segmentIndex++) {
          const segment = videoSegments[segmentIndex];
          if (!segment || segment.length === 0) {
            if (options.emitLog && options.requestId) options.emitLog(`❌ Segment ${segmentIndex + 1} is empty. Skipping...`, options.requestId);
            continue;
          }
          if (options.emitLog && options.requestId) options.emitLog(`🏷️ Generating title for segment ${segmentIndex + 1}/${videoSegments.length} (${segment.length} video prompts)...`, options.requestId);
          const segmentLines = segment.map(prompt => prompt.line).join('\n');
          const segmentVideoPrompts = segment.map(prompt => prompt.video_prompt).join('\n\n');
          let title = '';
          let titleJson: string | Record<string, any> | null = null;
          try {
            halloweenTransformLogTitlePrompt(segmentLines, segmentVideoPrompts, globalStyle);
            titleJson = await executePipelineStepWithTracking({
              stepName: 'HALLOWEEN TRANSFORM TITLE',
              promptTemplate: halloweenTransformTitlePrompt,
              options: { model: titleModel, temperature: titleTemperature },
              params: { songLyrics: segmentLines, videoPrompt: segmentVideoPrompts, globalStyle: globalStyle },
              requests
            });
            if (titleJson) {
              const parsed = typeof titleJson === 'string' ? safeJsonParse(titleJson, 'HALLOWEEN TRANSFORM TITLE') : titleJson;
              if (parsed && typeof parsed === 'object') title = parsed.title || '';
            } else {
              if (options.emitLog && options.requestId) options.emitLog(`❌ Failed to generate title for segment ${segmentIndex + 1}. Retrying...`, options.requestId);
              break;
            }
          } catch (e) {
            if (options.emitLog && options.requestId) options.emitLog(`❌ Error generating title for segment ${segmentIndex + 1}: ${e instanceof Error ? e.message : String(e)}`, options.requestId);
            break;
          }
          titles.push(title);
        }

        if (titles.length !== videoSegments.length) {
          if (options.emitLog && options.requestId) options.emitLog(`❌ Incomplete data generated. Expected ${videoSegments.length} titles, got: ${titles.length}. Retrying...`, options.requestId);
          continue;
        } else {
          if (options.emitLog && options.requestId) options.emitLog(`✅ Successfully generated all titles!`, options.requestId);
        }

        let additionalFrames: HalloweenAdditionalFramePrompt[] = [];
        if (options.generateAdditionalFrames) {
          if (options.emitLog && options.requestId) options.emitLog(`🎬 Generating group frames (every 3 characters)...`, options.requestId);
          try {
            const groupImageModel = 'anthropic/claude-3.7-sonnet';
            const groupImageTemperature = 0.3;
            const groupVideoModel = 'anthropic/claude-3.7-sonnet';
            const groupVideoTemperature = 0.5;
            const groups: HalloweenImagePrompt[][] = [];
            for (let i = 0; i < prompts.length; i += 3) {
              const group = prompts.slice(i, i + 3);
              if (group.length === 3) groups.push(group);
            }
            if (options.emitLog && options.requestId) options.emitLog(`📚 Created ${groups.length} groups of 3 characters each`, options.requestId);
            for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
              const group = groups[groupIndex];
              if (!group) continue;
              if (options.emitLog && options.requestId) options.emitLog(`🎨 Generating group ${groupIndex + 1}/${groups.length}...`, options.requestId);
              const threePrompts = group.map(p => `Line: "${p.line}"\nPrompt: ${p.prompt}`).join('\n\n');
              let groupImagePrompt = '';
              let imageAttempts = 0;
              const maxImageAttempts = 3;
              while (imageAttempts < maxImageAttempts && !groupImagePrompt) {
                imageAttempts++;
                if (options.emitLog && options.requestId) options.emitLog(`🖼️ Generating group image prompt (attempt ${imageAttempts}/${maxImageAttempts})...`, options.requestId);
                logHalloweenTransformGroupImagePrompt(globalStyle, threePrompts);
                const groupImageJson: string | Record<string, any> | null = await executePipelineStepWithTracking({
                  stepName: 'HALLOWEEN TRANSFORM GROUP IMAGE',
                  promptTemplate: halloweenTransformGroupImagePrompt,
                  options: { model: groupImageModel, temperature: groupImageTemperature },
                  params: { globalStyle: globalStyle, prompts: threePrompts },
                  requests
                });
                if (groupImageJson) {
                  const parsed = typeof groupImageJson === 'string' ? safeJsonParse(groupImageJson, 'HALLOWEEN TRANSFORM GROUP IMAGE') : groupImageJson;
                  if (parsed && typeof parsed === 'object' && parsed.group_image_prompt) {
                    const candidatePrompt = parsed.group_image_prompt;
                    if (candidatePrompt.length <= 1500) {
                      groupImagePrompt = candidatePrompt;
                      if (options.emitLog && options.requestId) options.emitLog(`✅ Group image prompt generated (${candidatePrompt.length} characters)`, options.requestId);
                    } else {
                      if (options.emitLog && options.requestId) options.emitLog(`⚠️ Group image prompt too long: ${candidatePrompt.length} characters (max 1500). Retrying...`, options.requestId);
                    }
                  }
                }
                if (!groupImagePrompt && imageAttempts < maxImageAttempts) await new Promise(resolve => setTimeout(resolve, 1000));
              }
              if (!groupImagePrompt) {
                if (options.emitLog && options.requestId) options.emitLog(`❌ Failed to generate group image prompt for group ${groupIndex + 1} after ${maxImageAttempts} attempts. Skipping...`, options.requestId);
                continue;
              }
              let groupVideoPrompt = '';
              let videoAttempts = 0;
              const maxVideoAttempts = 3;
              while (videoAttempts < maxVideoAttempts && !groupVideoPrompt) {
                videoAttempts++;
                if (options.emitLog && options.requestId) options.emitLog(`🎬 Generating group video prompt (attempt ${videoAttempts}/${maxVideoAttempts})...`, options.requestId);
                logHalloweenTransformGroupVideoPrompt(groupImagePrompt);
                const groupVideoJson: string | Record<string, any> | null = await executePipelineStepWithTracking({
                  stepName: 'HALLOWEEN TRANSFORM GROUP VIDEO',
                  promptTemplate: halloweenTransformGroupVideoPrompt,
                  options: { model: groupVideoModel, temperature: groupVideoTemperature },
                  params: { groupImagePrompt: groupImagePrompt },
                  requests
                });
                if (groupVideoJson) {
                  const parsed = typeof groupVideoJson === 'string' ? safeJsonParse(groupVideoJson, 'HALLOWEEN TRANSFORM GROUP VIDEO') : groupVideoJson;
                  if (parsed && typeof parsed === 'object' && parsed.group_video_prompt) {
                    const candidatePrompt = parsed.group_video_prompt;
                    if (candidatePrompt.length <= 1500) {
                      groupVideoPrompt = candidatePrompt;
                      if (options.emitLog && options.requestId) options.emitLog(`✅ Group video prompt generated (${candidatePrompt.length} characters)`, options.requestId);
                    } else {
                      if (options.emitLog && options.requestId) options.emitLog(`⚠️ Group video prompt too long: ${candidatePrompt.length} characters (max 1500). Retrying...`, options.requestId);
                    }
                  }
                }
                if (!groupVideoPrompt && videoAttempts < maxVideoAttempts) await new Promise(resolve => setTimeout(resolve, 1000));
              }
              if (!groupVideoPrompt) {
                if (options.emitLog && options.requestId) options.emitLog(`❌ Failed to generate group video prompt for group ${groupIndex + 1} after ${maxVideoAttempts} attempts. Skipping...`, options.requestId);
                continue;
              }
              additionalFrames.push({
                index: groupIndex,
                lines: group.map(p => p.line),
                group_image_prompt: groupImagePrompt,
                group_video_prompt: groupVideoPrompt
              });
              if (options.emitLog && options.requestId) options.emitLog(`✅ Generated group ${groupIndex + 1} with image and video prompts`, options.requestId);
            }
            if (options.emitLog && options.requestId) options.emitLog(`✅ Successfully generated ${additionalFrames.length} group frames`, options.requestId);
          } catch (e) {
            if (options.emitLog && options.requestId) options.emitLog(`❌ Error generating group frames: ${e instanceof Error ? e.message : String(e)}. Continuing without them...`, options.requestId);
          }
        }

        const songResult: HalloweenTransformOutput = {
          global_style: globalStyle,
          prompts,
          video_prompts: videoPrompts,
          titles,
          additional_frames: additionalFrames.length > 0 ? additionalFrames : undefined,
          requests: requests.length > 0 ? requests : undefined
        };
        results.push(songResult);

        if (options.emitLog && options.requestId) options.emitLog(`💾 Saving result...`, options.requestId);
        const generationsDir = getGenerationsDir();
        if (generationsDir) {
          const unprocessedDir = path.join(generationsDir, 'unprocessed');
          await fs.mkdir(unprocessedDir, { recursive: true });
          const fileNumber = await getNextFileNumber(generationsDir);
          const filename = `${fileNumber}-${selectedStyle}.json`;
          const filePath = path.join(unprocessedDir, filename);
          await fs.writeFile(filePath, JSON.stringify(songResult, null, 2), 'utf-8');
        }
        if (options.emitLog && options.requestId) options.emitLog(`✅ Generation finished with ${selectedStyle} style`, options.requestId);
        finished = true;
      } catch (error) {
        if (options.emitLog && options.requestId) options.emitLog(`❌ Error generating song: ${error instanceof Error ? error.message : String(error)}`, options.requestId);
        if (attempt >= maxAttempts) {
          if (options.emitLog && options.requestId) options.emitLog(`🚫 Failed to generate song after ${maxAttempts} attempts. Skipping.`, options.requestId);
        }
      }
    }
  }
  return results;
}

