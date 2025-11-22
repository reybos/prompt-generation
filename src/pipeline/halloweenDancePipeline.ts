import { HalloweenInput, HalloweenOutput, HalloweenImagePrompt, HalloweenVideoPrompt, HalloweenAdditionalFramePrompt } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { createImagePromptWithStyle } from '../promts/halloween_dance/index.js';
import { halloweenVideoPrompt, halloweenTitlePrompt, halloweenLogVideoPrompt, halloweenLogTitlePrompt, halloweenGroupImagePrompt, halloweenGroupVideoPrompt, logHalloweenGroupImagePrompt, logHalloweenGroupVideoPrompt } from '../promts/index.js';
import { PipelineConfig } from './pipelineConfig.js';
import { runBasePipeline } from './basePipeline.js';

/**
 * Create pipeline configuration for Halloween dance
 */
function createHalloweenDanceConfig(): PipelineConfig<HalloweenImagePrompt, HalloweenVideoPrompt> {
  return {
    pipelineName: '🎃 Generating Halloween song',
    getStyleName: () => 'halloweenNew', // Fixed style for Halloween pipeline
    
    models: {
      image: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.3 },
      video: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.5 },
      title: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.7 },
      groupImage: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.3 },
      groupVideo: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.5 }
    },
    
    prompts: {
      createImagePrompt: createImagePromptWithStyle,
      videoPrompt: halloweenVideoPrompt,
      titlePrompt: halloweenTitlePrompt,
      groupImagePrompt: halloweenGroupImagePrompt,
      groupVideoPrompt: halloweenGroupVideoPrompt
    },
    
    loggers: {
      logVideoPrompt: halloweenLogVideoPrompt,
      logTitlePrompt: halloweenLogTitlePrompt,
      logGroupImagePrompt: logHalloweenGroupImagePrompt,
      logGroupVideoPrompt: logHalloweenGroupVideoPrompt
    },
    
    formatters: {
      formatImagePromptsForVideo: (prompts) => {
        return prompts.map(p => `Line: "${p.line}"\nPrompt: ${p.prompt}`).join('\n\n');
      }
    },
    
    parsers: {
      parseVideoPrompts: (parsed, options) => {
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.video_prompts)) {
          const rawVideoPrompts = parsed.video_prompts;
          return rawVideoPrompts.map((prompt: any, index: number) => ({
            ...prompt,
            index: index
          })) as HalloweenVideoPrompt[];
        }
        return null;
      }
    },
    
    stepNames: {
      image: 'HALLOWEEN IMAGE PROMPTS',
      video: 'HALLOWEEN VIDEO PROMPTS',
      title: 'HALLOWEEN TITLE',
      groupImage: 'HALLOWEEN GROUP IMAGE',
      groupVideo: 'HALLOWEEN GROUP VIDEO'
    }
  };
}

/**
 * Run the complete Halloween song generation pipeline (including titles)
 * @param input - The Halloween input (array of song objects with lyrics)
 * @param options - Pipeline options
 * @returns The generated Halloween outputs (one per song)
 */
export async function runHalloweenPipeline(
  input: HalloweenInput,
  options: PipelineOptions = {}
): Promise<HalloweenOutput[]> {
  const config = createHalloweenDanceConfig();
  return runBasePipeline<HalloweenInput[0], HalloweenImagePrompt, HalloweenVideoPrompt, HalloweenOutput>(
    input,
    config,
    options
  );
}
