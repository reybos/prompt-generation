import { PoemsDirectVideoInput, PoemsDirectVideoOutput, PoemsDirectVideoVideoPrompt } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { poemsDirectVideoVideoPrompt, poemsDirectVideoTitlePrompt, logPoemsDirectVideoVideoPrompt, logPoemsDirectVideoTitlePrompt } from '../promts/poems_direct_video/index.js';
import { getVideoPromptStyleSuffix } from '../promts/poems_direct_video/videoPromptStyle.js';
import { PipelineConfig } from './pipelineConfig.js';
import { runBasePipeline } from './basePipeline.js';

/**
 * Create pipeline configuration for Poems Direct Video
 */
function createPoemsDirectVideoConfig(): PipelineConfig<any, PoemsDirectVideoVideoPrompt> {
  return {
    pipelineName: '📹 Generating Poems Direct Video',
    getPipelineIdentifier: () => 'poems-direct-video', // Pipeline identifier for filenames and logging
    
    models: {
      image: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.3 },
      video: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.5 },
      title: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.7 },
      groupImage: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.3 },
      groupVideo: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.5 }
    },
    
    prompts: {
      // createImagePrompt is not needed when skipImageStep is true
      videoPrompt: poemsDirectVideoVideoPrompt,
      titlePrompt: poemsDirectVideoTitlePrompt,
      // groupImagePrompt and groupVideoPrompt are not needed as group frames are not supported
      groupImagePrompt: poemsDirectVideoVideoPrompt, // Placeholder, won't be used
      groupVideoPrompt: poemsDirectVideoVideoPrompt // Placeholder, won't be used
    },
    
    loggers: {
      logVideoPrompt: logPoemsDirectVideoVideoPrompt,
      logTitlePrompt: logPoemsDirectVideoTitlePrompt,
      logGroupImagePrompt: () => {}, // Not used
      logGroupVideoPrompt: () => {} // Not used
    },
    
    formatters: {
      // formatImagePromptsForVideo is not needed when skipImageStep is true
      buildVideoParamsFromLyrics: (songLyrics: string) => {
        return { songLyrics };
      }
    },
    
    parsers: {
      parseVideoPrompts: (parsed, options) => {
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.video_prompts)) {
          const rawVideoPrompts = parsed.video_prompts;
          return rawVideoPrompts.map((prompt: any, index: number) => ({
            ...prompt,
            index: index
          })) as PoemsDirectVideoVideoPrompt[];
        }
        return null;
      }
    },
    
    // Post-processing: append style suffix to video prompts
    postProcessVideoPrompts: (prompts: PoemsDirectVideoVideoPrompt[]) => {
      const styleSuffix = getVideoPromptStyleSuffix();
      return prompts.map(prompt => ({
        ...prompt,
        video_prompt: prompt.video_prompt + "; " + styleSuffix
      }));
    },
    
    // Note: Group frames are not supported for direct video pipeline
    // as they require image prompts which are not generated
    
    // Skip image step - generate video prompts directly from lyrics
    skipImageStep: true,
    
    stepNames: {
      image: 'POEMS DIRECT VIDEO IMAGE PROMPTS',
      video: 'POEMS DIRECT VIDEO VIDEO PROMPTS',
      title: 'POEMS DIRECT VIDEO TITLE',
      groupImage: 'POEMS DIRECT VIDEO GROUP IMAGE',
      groupVideo: 'POEMS DIRECT VIDEO GROUP VIDEO'
    }
  };
}

/**
 * Run the complete Poems Direct Video generation pipeline (including titles)
 * @param input - The Poems Direct Video input (array of song objects with lyrics)
 * @param options - Pipeline options
 * @returns The generated Poems Direct Video outputs (one per song)
 */
export async function runPoemsDirectVideoPipeline(
  input: PoemsDirectVideoInput,
  options: PipelineOptions = {}
): Promise<PoemsDirectVideoOutput[]> {
  const config = createPoemsDirectVideoConfig();
  return runBasePipeline<any, any, PoemsDirectVideoVideoPrompt, PoemsDirectVideoOutput>(
    input,
    config,
    options
  );
}

