import { HalloweenInput, HalloweenImagePrompt, HalloweenAdditionalFramePrompt, HalloweenTransformVideoPrompt, HalloweenTransformOutput } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { createImagePromptWithStyle } from '../promts/halloween_transform/imagePrompt.js';
import { halloweenTransformVideoPrompt, halloweenTransformTitlePrompt, halloweenTransformLogVideoPrompt, halloweenTransformLogTitlePrompt, halloweenTransformGroupImagePrompt, halloweenTransformGroupVideoPrompt, logHalloweenTransformGroupImagePrompt, logHalloweenTransformGroupVideoPrompt } from '../promts/index.js';
import { PipelineConfig } from './pipelineConfig.js';
import { runBasePipeline } from './basePipeline.js';

/**
 * Create pipeline configuration for Halloween transform
 */
function createHalloweenTransformConfig(): PipelineConfig<HalloweenImagePrompt, HalloweenTransformVideoPrompt> {
  return {
    pipelineName: '🎃 Generating Halloween Transform song',
    getStyleName: () => 'halloweenTransform',
    
    models: {
      image: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.3 },
      video: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.5 },
      title: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.7 },
      groupImage: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.3 },
      groupVideo: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.5 }
    },
    
    prompts: {
      createImagePrompt: createImagePromptWithStyle,
      videoPrompt: halloweenTransformVideoPrompt,
      titlePrompt: halloweenTransformTitlePrompt,
      groupImagePrompt: halloweenTransformGroupImagePrompt,
      groupVideoPrompt: halloweenTransformGroupVideoPrompt
    },
    
    loggers: {
      logVideoPrompt: halloweenTransformLogVideoPrompt,
      logTitlePrompt: halloweenTransformLogTitlePrompt,
      logGroupImagePrompt: logHalloweenTransformGroupImagePrompt,
      logGroupVideoPrompt: logHalloweenTransformGroupVideoPrompt
    },
    
    formatters: {
      formatImagePromptsForVideo: (prompts) => {
        // For transform pipelines, format as JSON string
        return JSON.stringify(prompts.map(p => ({ line: p.line, prompt: p.prompt, index: p.index })));
      },
      buildVideoParams: (globalStyle, imagePromptsFormatted) => {
        // Transform pipelines only use image_prompts, not global_style
        return { image_prompts: imagePromptsFormatted };
      }
    },
    
    parsers: {
      parseVideoPrompts: (parsed, options) => {
        // Transform pipelines return array directly, not wrapped in video_prompts
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed)) {
          const rawVideoPrompts = parsed;
          return rawVideoPrompts.map((prompt: any, index: number) => ({
            line: prompt.line || '',
            prompt: prompt.prompt || '',
            video_prompt: prompt.video_prompt || '',
            index: prompt.index !== undefined ? prompt.index : index
          })) as HalloweenTransformVideoPrompt[];
        }
        return null;
      }
    },
    
    stepNames: {
      image: 'HALLOWEEN TRANSFORM IMAGE PROMPTS',
      video: 'HALLOWEEN TRANSFORM VIDEO PROMPTS',
      title: 'HALLOWEEN TRANSFORM TITLE',
      groupImage: 'HALLOWEEN TRANSFORM GROUP IMAGE',
      groupVideo: 'HALLOWEEN TRANSFORM GROUP VIDEO'
    }
  };
}

export async function runHalloweenTransformPipeline(
  input: HalloweenInput,
  options: PipelineOptions = {}
): Promise<HalloweenTransformOutput[]> {
  const config = createHalloweenTransformConfig();
  return runBasePipeline<HalloweenInput[0], HalloweenImagePrompt, HalloweenTransformVideoPrompt, HalloweenTransformOutput>(
    input,
    config,
    options
  );
}
