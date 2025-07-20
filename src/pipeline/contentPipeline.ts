/* START GENAI */
/**
 * Content Pipeline
 * Implements the main content generation pipeline
 */
import { createChain } from '../chains/index.js';
import { safeJsonParse, executePipelineStep } from '../utils/index.js';
import {
    scriptPrompt,
    characterPrompt,
    mediaPrompt,
    enhanceMediaPrompt,
    musicPrompt,
    titleDescPrompt,
    hashtagsPrompt,
    shortenVideoPrompt,
    narrationPrompt,
} from '../promts/index.js';
import config from '../config/index.js';
import { ContentPackage, PipelineOptions } from '../types/pipeline.js';
import { Runnable } from '@langchain/core/runnables';
import { ChainValues } from '@langchain/core/utils/types';
import fs from 'fs/promises';
import path from 'path';
import { getGenerationsDir } from '../server.js';
import { getNextFileNumber } from '../utils/fileUtils.js';

/**
 * Run the complete content generation pipeline
 * @param topic - The topic for the video
 * @param options - Options for the pipeline
 * @returns The complete generated content or null on failure
 */
async function runContentPipeline(
    topics: Record<string, string[]>,
    options: PipelineOptions = {}
): Promise<Record<string, Record<string, ContentPackage | null>>> {
    if (!topics) {
        console.error('No topics provided to content pipeline.');
        return {};
    }
    const channelName: string = options.channelName || config.defaultChannelName;

    // Set models for each step here
    const scriptModel = 'openai/gpt-4o';
    const scriptTemperature = 0.55;
    const characterModel = 'openai/gpt-4o';
    const characterTemperature = 0.4;
    const mediaModel = 'anthropic/claude-3.7-sonnet';
    const mediaTemperature = 0.3;
    const enhanceMediaModel = 'anthropic/claude-3.7-sonnet';
    const enhanceMediaTemperature = 0.3;
    const shortenVideoModel = 'anthropic/claude-3.7-sonnet';
    const shortenTemperature = 0.1;
    const musicModel = 'anthropic/claude-3.7-sonnet';
    const musicTemperature = 0.6;
    const titleDescModel = 'anthropic/claude-3.7-sonnet';
    const titleTemperature = 0.8;
    const hashtagsModel = 'anthropic/claude-3.7-sonnet';
    const hashtagsTemperature = 0.4;

    const results: Record<string, Record<string, ContentPackage | null>> = {};

    for (const theme in topics) {
        results[theme] = {};
        const themeTopics = topics[theme];
        if (!Array.isArray(themeTopics)) continue;
        for (const topic of themeTopics) {
            let attempt = 0;
            const maxTopicAttempts = 3;
            let finished = false;
            while (attempt < maxTopicAttempts && !finished) {
                attempt++;
                try {
                    if (options.emitLog && options.requestId) {
                        options.emitLog(`📝 Generating script for "${topic}"... (Attempt ${attempt})`, options.requestId);
                    }
                    // 1. Generate Script
                    const scriptChain: Runnable<ChainValues, string> = createChain(scriptPrompt, { model: scriptModel, temperature: scriptTemperature });
                    const scriptJson: string | Record<string, any> | null = await executePipelineStep(
                        'SCRIPT',
                        scriptChain,
                        { topic }
                    );
                    if (!scriptJson) { results[theme][topic] = null; break; }

                    if (options.emitLog && options.requestId) {
                        options.emitLog(`🎭 Generating character for "${topic}"...`, options.requestId);
                    }
                    // 2. Generate Character
                    const scenesArr = (scriptJson as Record<string, any>).scenes || [];
                    const introObject: any = scenesArr.length > 0 ? scenesArr[0] : {};
                    const characterChain: Runnable<ChainValues, string> = createChain(characterPrompt, { model: characterModel, temperature: characterTemperature });
                    const characterJson: string | Record<string, any> | null = await executePipelineStep(
                        'CHARACTER',
                        characterChain,
                        {
                            title: introObject.title || '',
                            description: introObject.description || '',
                            narration: introObject.narration || '',
                        }
                    );
                    if (!characterJson) { results[theme][topic] = null; break; }

                    if (options.emitLog && options.requestId) {
                        options.emitLog(`🖼️ Generating media prompts for "${topic}"...`, options.requestId);
                    }
                    // 3. Generate Media Prompts
                    const scriptStr: string = JSON.stringify(scriptJson, null, 2);
                    const characterStr: string = JSON.stringify(characterJson, null, 2);
                    const mediaChain: Runnable<ChainValues, string> = createChain(mediaPrompt, { model: mediaModel, temperature: mediaTemperature });
                    const mediaJson: string | Record<string, any> | null = await executePipelineStep(
                        'MEDIA PROMPTS',
                        mediaChain,
                        { script: scriptStr, character: characterStr }
                    );
                    if (!mediaJson) { results[theme][topic] = null; break; }

                    if (options.emitLog && options.requestId) {
                        options.emitLog(`✨ Generating enhanced media prompts for "${topic}"...`, options.requestId);
                    }
                    // 4. Enhance Media Prompts
                    const mediaStr: string = JSON.stringify(mediaJson, null, 2);
                    const enhanceMediaChain: Runnable<ChainValues, string> = createChain(enhanceMediaPrompt, { model: enhanceMediaModel, temperature: enhanceMediaTemperature });
                    const enhancedMediaJson: string | Record<string, any> | null = await executePipelineStep(
                        'ENHANCED MEDIA PROMPTS',
                        enhanceMediaChain,
                        { media_prompts: mediaStr, character: characterStr, script: scriptStr }
                    );
                    if (!enhancedMediaJson) { results[theme][topic] = null; break; }

                    // 4a. Shorten video prompts if needed
                    let enhancedMediaObj = (typeof enhancedMediaJson === 'string') ? safeJsonParse(enhancedMediaJson, 'ENHANCED MEDIA') : enhancedMediaJson;
                    let needsShortening = false;
                    let shorteningFailed = false;
                    if (Array.isArray(enhancedMediaObj)) {
                        for (let scene of enhancedMediaObj) {
                            if (scene.video_prompt && scene.video_prompt.length >= 2000) {
                                needsShortening = true;
                                if (options.emitLog && options.requestId) {
                                    options.emitLog(`✂️ Shortening long video prompt for scene ${scene.scene}...`, options.requestId);
                                }
                                let currentPrompt = scene.video_prompt;
                                let shortenedPrompt = currentPrompt;
                                let attempts = 0;
                                const maxAttempts = 3;
                                while (shortenedPrompt.length >= 2000 && attempts < maxAttempts) {
                                    const shortenChain: Runnable<ChainValues, string> = createChain(shortenVideoPrompt, { model: shortenVideoModel, temperature: shortenTemperature });
                                    const result: string | null = await executePipelineStep(
                                        'SHORTEN VIDEO PROMPT',
                                        shortenChain,
                                        { video_prompt: shortenedPrompt }
                                    );
                                    if (result && typeof result === 'string') {
                                        shortenedPrompt = result;
                                    } else {
                                        break; // If LLM fails, stop retrying
                                    }
                                    attempts++;
                                }
                                if (shortenedPrompt.length >= 2000) {
                                    if (options.emitLog && options.requestId) {
                                        options.emitLog(`⚠️ Warning: Video prompt for scene ${scene.scene} is still too long after ${maxAttempts} attempts. Length: ${shortenedPrompt.length}`, options.requestId);
                                    }
                                    shorteningFailed = true;
                                    break; // Stop processing this topic and retry from step 1
                                }
                                scene.video_prompt = shortenedPrompt;
                            }
                        }
                    }
                    if (shorteningFailed) {
                        if (options.emitLog && options.requestId) {
                            options.emitLog(`🔁 Restarting generation for "${topic}" due to failed shortening. (Attempt ${attempt} of ${maxTopicAttempts})`, options.requestId);
                        }
                        if (attempt >= maxTopicAttempts) {
                            results[theme][topic] = null;
                        }
                        continue; // Retry the topic from the beginning
                    }
                    // If we modified, use the updated object for downstream
                    const finalEnhancedMedia = needsShortening ? enhancedMediaObj : enhancedMediaJson;

                    // 4b. Generate Detailed Narration for Voiceover
                    if (options.emitLog && options.requestId) {
                        options.emitLog(`🎤 Generating detailed narration for voiceover for "${topic}"...`, options.requestId);
                    }
                    const narrationChain: Runnable<ChainValues, string> = createChain(narrationPrompt, { model: scriptModel, temperature: scriptTemperature });
                    const narrationJson: string | Record<string, any> | null = await executePipelineStep(
                        'NARRATION',
                        narrationChain,
                        { script: scriptStr, enhancedMedia: JSON.stringify(finalEnhancedMedia, null, 2) }
                    );
                    if (!narrationJson) { results[theme][topic] = null; break; }

                    if (options.emitLog && options.requestId) {
                        options.emitLog(`🎵 Generating music suggestions for "${topic}"...`, options.requestId);
                    }
                    // 5. Generate Music Suggestions
                    const musicChain: Runnable<ChainValues, string> = createChain(musicPrompt, { model: musicModel, temperature: musicTemperature });
                    const musicJson: string | Record<string, any> | null = await executePipelineStep(
                        'MUSIC SUGGESTIONS',
                        musicChain,
                        { topic, script: scriptStr },
                        true,
                        'music suggestions'
                    );
                    if (!musicJson) { results[theme][topic] = null; break; }

                    if (options.emitLog && options.requestId) {
                        options.emitLog(`🏷️ Generating title and description for "${topic}"...`, options.requestId);
                    }
                    // 6. Generate Title and Description
                    const characterName: string = (characterJson as Record<string, any>)?.name || '';
                    const titleDescChain: Runnable<ChainValues, string> = createChain(titleDescPrompt, { model: titleDescModel, temperature: titleTemperature });
                    const titleDescJson: string | Record<string, any> | null = await executePipelineStep(
                        'TITLE AND DESCRIPTION',
                        titleDescChain,
                        { topic, script: scriptStr, character: characterName },
                        true,
                        'title and description'
                    );
                    if (!titleDescJson) { results[theme][topic] = null; break; }

                    if (options.emitLog && options.requestId) {
                        options.emitLog(`#️⃣ Generating hashtags for "${topic}"...`, options.requestId);
                    }
                    // 7. Generate Hashtags
                    const hashtagsChain: Runnable<ChainValues, string> = createChain(hashtagsPrompt, { model: hashtagsModel, temperature: hashtagsTemperature });
                    const hashtagsText: string | Record<string, any> | null = await executePipelineStep(
                        'HASHTAGS',
                        hashtagsChain,
                        { topic, script: scriptStr, character: characterName, channel: channelName },
                        false
                    );
                    if (!hashtagsText) { results[theme][topic] = null; break; }

                    // Return all generated data as ContentPackage
                    results[theme][topic] = {
                        script: scriptJson as any,
                        character: characterJson as any,
                        media: mediaJson as any,
                        enhancedMedia: finalEnhancedMedia as any,
                        narration: narrationJson as any,
                        music: musicJson as any,
                        titleDesc: titleDescJson as any,
                        hashtags: typeof hashtagsText === 'string' ? hashtagsText : JSON.stringify(hashtagsText),
                    };

                    // Save to file in unprocessed folder
                    const generationsDir = getGenerationsDir();
                    if (generationsDir && results[theme][topic]) {
                        const unprocessedDir = path.join(generationsDir, 'unprocessed');
                        await fs.mkdir(unprocessedDir, { recursive: true });
                        let safeTheme = theme.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
                        let safeTopic = topic.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
                        safeTheme = safeTheme.replace(/^_+|_+$/g, '');
                        safeTopic = safeTopic.replace(/^_+|_+$/g, '');
                        const fileNumber = await getNextFileNumber(generationsDir);
                        // Use dash between number and topic only (removed theme)
                        const filename = `${fileNumber}-${safeTopic}.json`;
                        const cleanedFilename = filename.replace(/-+\.json$/, '.json');
                        const filePath = path.join(unprocessedDir, cleanedFilename);
                        await fs.writeFile(filePath, JSON.stringify(results[theme][topic], null, 2), 'utf-8');
                    }
                    // Emit finished log
                    if (options.emitLog && options.requestId) {
                        options.emitLog(`✅ Generation finished for "${topic}"`, options.requestId);
                    }
                    finished = true;
                } catch (error) {
                    console.error(`Error generating content for theme "${theme}", topic "${topic}":`, error instanceof Error ? error.message : String(error));
                    results[theme][topic] = null;
                    break;
                }
            }
        }
    }
    return results;
}

export { runContentPipeline };
/* END GENAI */