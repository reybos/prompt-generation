/* START GENAI */
/**
 * Async Content Pipeline
 * Implements the main content generation pipeline using FAL.AI queue for async processing
 */
import { createChain } from '../../chains/index.js';
import { safeJsonParse, extractSystemPrompt } from '../../utils/index.js';
import {
    scriptPrompt,
    mediaPrompt,
    enhanceMediaPrompt,
    musicPrompt,
    titleDescPrompt,
    hashtagsPrompt,
    narrationPrompt,
} from '../../promts/index.js';
import config from '../../config/index.js';
import { ContentPackage, PipelineOptions, LLMRequest } from '../../types/pipeline.js';
import { Runnable } from '@langchain/core/runnables';
import { ChainValues } from '@langchain/core/utils/types';
import fs from 'fs/promises';
import path from 'path';
import { getGenerationsDir } from '../../config/index.js';
import { getNextFileNumber } from '../../utils/index.js';
import { 
    submitToQueueWithTracking, 
    batchCheckStatus, 
    getQueueResult, 
    updateRequestStatus,
    removeRequest
} from '../../services/index.js';

// Interface for pipeline step
interface PipelineStep {
    stepName: string;
    promptTemplate: any;
    params: Record<string, any>;
    model: string;
    temperature: number;
    parseJson: boolean;
    contextName?: string;
}

// Interface for async request
interface AsyncRequest {
    requestId: string;
    step: PipelineStep;
    topic: string;
    theme: string;
}

/**
 * Submit a pipeline step to the queue
 * @param step - The pipeline step to submit
 * @param topic - The topic being processed
 * @param theme - The theme being processed
 * @param requests - Array to store request tracking information
 * @returns The request ID
 */
async function submitPipelineStep(
    step: PipelineStep,
    topic: string,
    theme: string,
    requests: LLMRequest[]
): Promise<string> {
    const chain: Runnable<ChainValues, string> = createChain(step.promptTemplate, { 
        model: step.model, 
        temperature: step.temperature 
    });
    
    // Extract system prompt using utility function
    const systemPrompt = extractSystemPrompt(step.promptTemplate);
    
    // Format the prompt with parameters
    const formattedPrompt = await step.promptTemplate.format(step.params);
    
    // Submit to queue with tracking
    // Note: submitToQueueWithTracking doesn't use systemPrompt separately, it's all in formattedPrompt
    const requestId = await submitToQueueWithTracking(
        formattedPrompt,
        undefined, // System prompt is part of formattedPrompt in this case
        step.stepName,
        topic,
        {
            model: step.model,
            temperature: step.temperature
        }
    );
    
    // Store request information
    requests.push({
        prompt: formattedPrompt, // Formatted prompt with inserted data
        systemPrompt: systemPrompt, // Template/instructions before data insertion
        params: step.params, // Parameters that were inserted into placeholders
        model: step.model,
        requestId: requestId
    });
    
    return requestId;
}

/**
 * Check and collect completed results
 * @param requests - Array of async requests
 * @param options - Pipeline options
 * @returns Map of request ID to result
 */
async function collectResults(
    requests: AsyncRequest[],
    options: PipelineOptions
): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const requestIds = requests.map(req => req.requestId);
    
    // Batch check status
    const statusMap = await batchCheckStatus(requestIds);
    
    for (const [requestId, status] of statusMap.entries()) {
        const request = requests.find(req => req.requestId === requestId);
        if (!request) continue;
        
        if (status.status === 'COMPLETED') {
            try {
                const result = await getQueueResult(requestId);
                const step = request.step;
                
                let processedResult: any;
                if (step.parseJson) {
                    processedResult = safeJsonParse(result.data?.output || result, step.contextName || step.stepName.toLowerCase());
                } else {
                    processedResult = result.data?.output || result;
                }
                
                results.set(requestId, processedResult);
                updateRequestStatus(requestId, 'COMPLETED', processedResult);
                
                if (options.emitLog && options.requestId) {
                    options.emitLog(`✅ ${step.stepName} completed for "${request.topic}"`, options.requestId);
                }
                
                // Clean up completed request
                removeRequest(requestId);
                
            } catch (error) {
                console.error(`Error processing result for ${requestId}:`, error);
                updateRequestStatus(requestId, 'FAILED', undefined, error instanceof Error ? error.message : String(error));
            }
        } else if (status.status === 'FAILED') {
            console.error(`Request ${requestId} failed:`, status.error);
            updateRequestStatus(requestId, 'FAILED', undefined, status.error || 'Unknown error');
        } else {
            // Still processing
            if (options.emitLog && options.requestId) {
                const request = requests.find(req => req.requestId === requestId);
                if (request) {
                    options.emitLog(`⏳ ${request.step.stepName} still processing for "${request.topic}"`, options.requestId);
                }
            }
        }
    }
    
    return results;
}

/**
 * Run the complete content generation pipeline using async queue
 * @param topics - The topics for the video
 * @param options - Options for the pipeline
 * @returns The complete generated content or null on failure
 */
async function runContentPipelineAsync(
    topics: Record<string, string[]>,
    options: PipelineOptions = {}
): Promise<Record<string, Record<string, ContentPackage | null>>> {
    if (!topics) {
        console.error('No topics provided to content pipeline.');
        return {};
    }
    const channelName: string = options.channelName || config.defaultChannelName;

    // Set models for each step here
    // const scriptModel = 'openai/gpt-5-chat'; чет здесь одни попугаи, нужно проверить другие модели
    const scriptModel = 'openai/gpt-4.1'; // эту еще не пробовал, еще можно будет openai/gpt-4o
    const scriptTemperature = 0.6;
    const mediaModel = 'openai/gpt-5-chat';
    const mediaTemperature = 0.45;
    const enhanceMediaModel = 'openai/gpt-5-chat';
    const enhanceMediaTemperature = 0.3;
    const musicModel = 'anthropic/claude-3.7-sonnet';
    const musicTemperature = 0.6;
    const titleDescModel = 'anthropic/claude-3.7-sonnet';
    const titleTemperature = 0.8;
    const hashtagsModel = 'openai/gpt-5-chat';
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
                const requests: LLMRequest[] = [];
                try {
                    if (options.emitLog && options.requestId) {
                        options.emitLog(`🚀 Starting async generation for "${topic}"... (Attempt ${attempt})`, options.requestId);
                    }

                    // Step 1: Generate Script
                    const scriptStep: PipelineStep = {
                        stepName: 'SCRIPT',
                        promptTemplate: scriptPrompt,
                        params: { topic },
                        model: scriptModel,
                        temperature: scriptTemperature,
                        parseJson: true,
                        contextName: 'script'
                    };
                    
                    const scriptRequestId = await submitPipelineStep(scriptStep, topic, theme, requests);
                    
                    if (options.emitLog && options.requestId) {
                        options.emitLog(`📝 Script request submitted for "${topic}" (ID: ${scriptRequestId})`, options.requestId);
                    }

                    // Wait for script to complete before proceeding
                    let scriptResult: any = null;
                    let scriptAttempts = 0;
                    const maxScriptAttempts = 100; // 5 minutes with 3s intervals
                    
                    while (scriptAttempts < maxScriptAttempts && !scriptResult) {
                        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
                        
                        const statusMap = await batchCheckStatus([scriptRequestId]);
                        const status = statusMap.get(scriptRequestId);
                        
                        if (status?.status === 'COMPLETED') {
                            const result = await getQueueResult(scriptRequestId);
                            scriptResult = safeJsonParse(result.data?.output || result, 'script');
                            updateRequestStatus(scriptRequestId, 'COMPLETED', scriptResult);
                            removeRequest(scriptRequestId);
                            
                            if (options.emitLog && options.requestId) {
                                options.emitLog(`✅ Script completed for "${topic}"`, options.requestId);
                            }
                        } else if (status?.status === 'FAILED') {
                            throw new Error(`Script generation failed: ${status.error}`);
                        }
                        
                        scriptAttempts++;
                    }
                    
                    if (!scriptResult) {
                        throw new Error('Script generation timed out');
                    }

                    // Step 2: Generate Media Prompts (depends on script)
                    const scriptStr = JSON.stringify(scriptResult, null, 2);
                    const mediaStep: PipelineStep = {
                        stepName: 'MEDIA PROMPTS',
                        promptTemplate: mediaPrompt,
                        params: { script: scriptStr },
                        model: mediaModel,
                        temperature: mediaTemperature,
                        parseJson: true,
                        contextName: 'media'
                    };
                    
                    const mediaRequestId = await submitPipelineStep(mediaStep, topic, theme, requests);
                    
                    if (options.emitLog && options.requestId) {
                        options.emitLog(`🖼️ Media prompts request submitted for "${topic}" (ID: ${mediaRequestId})`, options.requestId);
                    }

                    // Wait for media to complete
                    let mediaResult: any = null;
                    let mediaAttempts = 0;
                    
                    while (mediaAttempts < maxScriptAttempts && !mediaResult) {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        
                        const statusMap = await batchCheckStatus([mediaRequestId]);
                        const status = statusMap.get(mediaRequestId);
                        
                        if (status?.status === 'COMPLETED') {
                            const result = await getQueueResult(mediaRequestId);
                            mediaResult = safeJsonParse(result.data?.output || result, 'media');
                            updateRequestStatus(mediaRequestId, 'COMPLETED', mediaResult);
                            removeRequest(mediaRequestId);
                            
                            if (options.emitLog && options.requestId) {
                                options.emitLog(`✅ Media prompts completed for "${topic}"`, options.requestId);
                            }
                        } else if (status?.status === 'FAILED') {
                            throw new Error(`Media generation failed: ${status.error}`);
                        }
                        
                        mediaAttempts++;
                    }
                    
                    if (!mediaResult) {
                        throw new Error('Media generation timed out');
                    }

                    // Validate scene count
                    const scriptScenes = Array.isArray(scriptResult) ? scriptResult : scriptResult?.scenes;
                    const mediaScenes = Array.isArray(mediaResult) ? mediaResult : mediaResult?.scenes || mediaResult;
                    if (scriptScenes && mediaScenes && scriptScenes.length !== mediaScenes.length) {
                        console.warn(`Scene count mismatch: Script has ${scriptScenes.length} scenes, Media has ${mediaScenes.length} scenes. Retrying...`);
                        if (options.emitLog && options.requestId) {
                            options.emitLog(`⚠️ Scene count mismatch detected. Retrying media generation... (Attempt ${attempt} of ${maxTopicAttempts})`, options.requestId);
                        }
                        if (attempt >= maxTopicAttempts) {
                            results[theme][topic] = null;
                        }
                        continue; // Retry the topic from the beginning
                    }

                    // Step 3: Submit remaining steps in parallel
                    const mediaStr = JSON.stringify(mediaResult, null, 2);
                    
                    const enhanceMediaStep: PipelineStep = {
                        stepName: 'ENHANCED MEDIA PROMPTS',
                        promptTemplate: enhanceMediaPrompt,
                        params: { media_prompts: mediaStr, script: scriptStr },
                        model: enhanceMediaModel,
                        temperature: enhanceMediaTemperature,
                        parseJson: true,
                        contextName: 'enhanced_media'
                    };
                    
                    const narrationStep: PipelineStep = {
                        stepName: 'NARRATION',
                        promptTemplate: narrationPrompt,
                        params: { script: scriptStr, enhancedMedia: mediaStr }, // Will be updated when enhanced media is ready
                        model: scriptModel,
                        temperature: scriptTemperature,
                        parseJson: true,
                        contextName: 'narration'
                    };
                    
                    const musicStep: PipelineStep = {
                        stepName: 'MUSIC SUGGESTIONS',
                        promptTemplate: musicPrompt,
                        params: { topic, script: scriptStr },
                        model: musicModel,
                        temperature: musicTemperature,
                        parseJson: true,
                        contextName: 'music'
                    };
                    
                    const titleDescStep: PipelineStep = {
                        stepName: 'TITLE AND DESCRIPTION',
                        promptTemplate: titleDescPrompt,
                        params: { topic, script: scriptStr },
                        model: titleDescModel,
                        temperature: titleTemperature,
                        parseJson: true,
                        contextName: 'title_desc'
                    };
                    
                    const hashtagsStep: PipelineStep = {
                        stepName: 'HASHTAGS',
                        promptTemplate: hashtagsPrompt,
                        params: { topic, script: scriptStr, channel: channelName },
                        model: hashtagsModel,
                        temperature: hashtagsTemperature,
                        parseJson: false
                    };

                    // Submit all remaining steps
                    const [enhanceMediaRequestId, musicRequestId, titleDescRequestId, hashtagsRequestId] = await Promise.all([
                        submitPipelineStep(enhanceMediaStep, topic, theme, requests),
                        submitPipelineStep(musicStep, topic, theme, requests),
                        submitPipelineStep(titleDescStep, topic, theme, requests),
                        submitPipelineStep(hashtagsStep, topic, theme, requests)
                    ]);
                    
                    if (options.emitLog && options.requestId) {
                        options.emitLog(`🚀 Parallel requests submitted for "${topic}": Enhanced Media, Music, Title, Hashtags`, options.requestId);
                    }

                    // Wait for enhanced media first (needed for narration)
                    let enhancedMediaResult: any = null;
                    let enhanceAttempts = 0;
                    
                    while (enhanceAttempts < maxScriptAttempts && !enhancedMediaResult) {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        
                        const statusMap = await batchCheckStatus([enhanceMediaRequestId]);
                        const status = statusMap.get(enhanceMediaRequestId);
                        
                        if (status?.status === 'COMPLETED') {
                            const result = await getQueueResult(enhanceMediaRequestId);
                            enhancedMediaResult = safeJsonParse(result.data?.output || result, 'enhanced_media');
                            updateRequestStatus(enhanceMediaRequestId, 'COMPLETED', enhancedMediaResult);
                            removeRequest(enhanceMediaRequestId);
                            
                            if (options.emitLog && options.requestId) {
                                options.emitLog(`✅ Enhanced media completed for "${topic}"`, options.requestId);
                            }
                        } else if (status?.status === 'FAILED') {
                            throw new Error(`Enhanced media generation failed: ${status.error}`);
                        }
                        
                        enhanceAttempts++;
                    }
                    
                    if (!enhancedMediaResult) {
                        throw new Error('Enhanced media generation timed out');
                    }

                    // Check video prompt lengths and use original scenes if needed
                    let finalEnhancedMedia = enhancedMediaResult;
                    let needsFallback = false;
                    let fallbackFailed = false;
                    
                    if (Array.isArray(enhancedMediaResult)) {
                        for (let i = 0; i < enhancedMediaResult.length; i++) {
                            const scene = enhancedMediaResult[i];
                            if (scene.video_prompt && scene.video_prompt.length >= 2000) {
                                if (options.emitLog && options.requestId) {
                                    options.emitLog(`⚠️ Enhanced video prompt for scene ${scene.scene} is too long (${scene.video_prompt.length} chars). Checking original scene...`, options.requestId);
                                }
                                
                                if (Array.isArray(mediaResult) && mediaResult[i] && mediaResult[i].video_prompt) {
                                    const originalPrompt = mediaResult[i].video_prompt;
                                    if (originalPrompt.length < 2000) {
                                        if (options.emitLog && options.requestId) {
                                            options.emitLog(`✅ Using original video prompt for scene ${scene.scene} (${originalPrompt.length} chars)`, options.requestId);
                                        }
                                        scene.video_prompt = originalPrompt;
                                        needsFallback = true;
                                    } else {
                                        if (options.emitLog && options.requestId) {
                                            options.emitLog(`❌ Original video prompt for scene ${scene.scene} is also too long (${originalPrompt.length} chars)`, options.requestId);
                                        }
                                        fallbackFailed = true;
                                        break;
                                    }
                                } else {
                                    if (options.emitLog && options.requestId) {
                                        options.emitLog(`❌ No original video prompt found for scene ${scene.scene}`, options.requestId);
                                    }
                                    fallbackFailed = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (fallbackFailed) {
                        if (options.emitLog && options.requestId) {
                            options.emitLog(`🔁 Restarting generation for "${topic}" due to video prompts being too long. (Attempt ${attempt} of ${maxTopicAttempts})`, options.requestId);
                        }
                        if (attempt >= maxTopicAttempts) {
                            results[theme][topic] = null;
                        }
                        continue; // Retry the topic from the beginning
                    }
                    
                    finalEnhancedMedia = needsFallback ? enhancedMediaResult : enhancedMediaResult;

                    // Now submit narration with the final enhanced media
                    const finalEnhancedMediaStr = JSON.stringify(finalEnhancedMedia, null, 2);
                    narrationStep.params.enhancedMedia = finalEnhancedMediaStr;
                    
                    const narrationRequestId = await submitPipelineStep(narrationStep, topic, theme, requests);
                    
                    if (options.emitLog && options.requestId) {
                        options.emitLog(`🎤 Narration request submitted for "${topic}" (ID: ${narrationRequestId})`, options.requestId);
                    }

                    // Wait for all remaining results
                    const remainingRequestIds = [narrationRequestId, musicRequestId, titleDescRequestId, hashtagsRequestId];
                    const remainingResults = new Map<string, any>();
                    let allCompleted = false;
                    let waitAttempts = 0;
                    
                    // Create a map of request IDs to step names for error reporting
                    const requestStepMap = new Map<string, string>([
                        [narrationRequestId, 'NARRATION'],
                        [musicRequestId, 'MUSIC SUGGESTIONS'],
                        [titleDescRequestId, 'TITLE AND DESCRIPTION'],
                        [hashtagsRequestId, 'HASHTAGS']
                    ]);
                    
                    while (!allCompleted && waitAttempts < maxScriptAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        
                        const statusMap = await batchCheckStatus(remainingRequestIds);
                        allCompleted = true;
                        
                        for (const requestId of remainingRequestIds) {
                            if (remainingResults.has(requestId)) continue;
                            
                            const status = statusMap.get(requestId);
                            if (status?.status === 'COMPLETED') {
                                const result = await getQueueResult(requestId);
                                const stepName = requestStepMap.get(requestId) || 'UNKNOWN';
                                
                                let processedResult: any;
                                // For narration, music, titleDesc - parse as JSON
                                if (stepName !== 'HASHTAGS') {
                                    processedResult = safeJsonParse(result.data?.output || result, stepName.toLowerCase());
                                } else {
                                    processedResult = result.data?.output || result;
                                }
                                
                                remainingResults.set(requestId, processedResult);
                                updateRequestStatus(requestId, 'COMPLETED', processedResult);
                                removeRequest(requestId);
                                
                                if (options.emitLog && options.requestId) {
                                    options.emitLog(`✅ ${stepName} completed for "${topic}"`, options.requestId);
                                }
                            } else if (status?.status === 'FAILED') {
                                const stepName = requestStepMap.get(requestId) || 'UNKNOWN';
                                throw new Error(`${stepName} generation failed: ${status.error}`);
                            } else {
                                allCompleted = false;
                            }
                        }
                        
                        waitAttempts++;
                    }
                    
                    if (!allCompleted) {
                        throw new Error('Some pipeline steps timed out');
                    }

                    // Get final results
                    const narrationResult = remainingResults.get(narrationRequestId);
                    const musicResult = remainingResults.get(musicRequestId);
                    const titleDescResult = remainingResults.get(titleDescRequestId);
                    const hashtagsResult = remainingResults.get(hashtagsRequestId);

                    // Final validation: ensure all parts have consistent scene counts
                    const finalScriptScenes = Array.isArray(scriptResult) ? scriptResult : scriptResult?.scenes;
                    const finalMediaScenes = Array.isArray(mediaResult) ? mediaResult : mediaResult?.scenes || mediaResult;
                    const finalEnhancedScenes = Array.isArray(finalEnhancedMedia) ? finalEnhancedMedia : finalEnhancedMedia?.scenes || finalEnhancedMedia;
                    const finalNarrationScenes = Array.isArray(narrationResult) ? narrationResult : narrationResult?.scenes || narrationResult;
                    
                    if (finalScriptScenes && finalMediaScenes && finalEnhancedScenes && finalNarrationScenes) {
                        const sceneCounts = {
                            script: finalScriptScenes.length,
                            media: finalMediaScenes.length,
                            enhanced: finalEnhancedScenes.length,
                            narration: finalNarrationScenes.length
                        };
                        
                        const allSame = Object.values(sceneCounts).every(count => count === sceneCounts.script);
                        if (!allSame) {
                            console.warn(`Final scene count validation failed:`, sceneCounts);
                            if (options.emitLog && options.requestId) {
                                options.emitLog(`⚠️ Scene count mismatch in final validation: Script(${sceneCounts.script}), Media(${sceneCounts.media}), Enhanced(${sceneCounts.enhanced}), Narration(${sceneCounts.narration})`, options.requestId);
                            }
                        }
                    }

                    // Return all generated data as ContentPackage
                    results[theme][topic] = {
                        script: scriptResult as any,
                        media: mediaResult as any,
                        enhancedMedia: finalEnhancedMedia as any,
                        narration: narrationResult as any,
                        music: musicResult as any,
                        titleDesc: titleDescResult as any,
                        hashtags: typeof hashtagsResult === 'string' ? hashtagsResult : JSON.stringify(hashtagsResult),
                        requests: requests.length > 0 ? requests : undefined
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
                        const filename = `${fileNumber}-${safeTopic}.json`;
                        const cleanedFilename = filename.replace(/-+\.json$/, '.json');
                        const filePath = path.join(unprocessedDir, cleanedFilename);
                        await fs.writeFile(filePath, JSON.stringify(results[theme][topic], null, 2), 'utf-8');
                    }
                    
                    // Emit finished log
                    if (options.emitLog && options.requestId) {
                        options.emitLog(`✅ Async generation finished for "${topic}"`, options.requestId);
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

export { runContentPipelineAsync };
/* END GENAI */
