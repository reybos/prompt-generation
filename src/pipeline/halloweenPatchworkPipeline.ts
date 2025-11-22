import { HalloweenPatchworkInput, HalloweenPatchworkOutput, HalloweenPatchworkImagePrompt, HalloweenPatchworkVideoPrompt, HalloweenPatchworkAdditionalFramePrompt } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { createImagePrompt } from '../promts/halloween_patchwork/imagePrompt.js';
import { halloweenPatchworkVideoPrompt, halloweenPatchworkTitlePrompt, halloweenPatchworkLogVideoPrompt, halloweenPatchworkLogTitlePrompt, halloweenPatchworkGroupImagePrompt, halloweenPatchworkGroupVideoPrompt, logHalloweenPatchworkGroupImagePrompt, logHalloweenPatchworkGroupVideoPrompt } from '../promts/index.js';
import { PipelineConfig } from './pipelineConfig.js';
import { runBasePipeline } from './basePipeline.js';
import { safeJsonParse } from '../utils/index.js';

/**
 * Create pipeline configuration for Halloween Patchwork
 */
function createHalloweenPatchworkConfig(): PipelineConfig<HalloweenPatchworkImagePrompt, HalloweenPatchworkVideoPrompt> {
  return {
    pipelineName: '🎃 Generating Halloween Patchwork',
    getPipelineIdentifier: () => 'halloweenPatchwork', // Pipeline identifier for filenames and logging
    
    models: {
      image: { model: 'openai/gpt-5-chat', temperature: 0.3 },
      video: { model: 'anthropic/claude-3.7-sonnet', temperature: 0.5 },
      title: { model: 'openai/gpt-5-chat', temperature: 0.7 },
      groupImage: { model: 'anthropic/claude-3.7-sonnet', temperature: 0.6 },
      groupVideo: { model: 'anthropic/claude-3.7-sonnet', temperature: 0.5 }
    },
    
    prompts: {
      createImagePrompt: (style: string) => createImagePrompt(), // Style parameter ignored, using hardcoded style
      videoPrompt: halloweenPatchworkVideoPrompt,
      titlePrompt: halloweenPatchworkTitlePrompt,
      groupImagePrompt: halloweenPatchworkGroupImagePrompt,
      groupVideoPrompt: halloweenPatchworkGroupVideoPrompt
    },
    
    loggers: {
      logVideoPrompt: halloweenPatchworkLogVideoPrompt,
      logTitlePrompt: halloweenPatchworkLogTitlePrompt,
      logGroupImagePrompt: logHalloweenPatchworkGroupImagePrompt,
      logGroupVideoPrompt: logHalloweenPatchworkGroupVideoPrompt
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
          })) as HalloweenPatchworkVideoPrompt[];
        }
        return null;
      }
    },
    
    globalStyle: {
      getInitial: async (style: string, options: PipelineOptions) => {
        // Use hardcoded global style from Halloween Patchwork
        const globalStyle = "Spooky-cute 3D cartoon characters stitched together from mismatched animal parts with visible black thread, glowing playful green pupil-less eyes, and patchwork bodies rendered in a Pixar-meets-Tim Burton animation style. Atmosphere is family-friendly Halloween with soft fog, glowing pumpkins, and cozy moonlit backdrops — eerie but always charming.";
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎨 Using Halloween Patchwork globalStyle`, options.requestId);
        }
        return globalStyle;
      },
      extractFromImageJson: (parsed, currentGlobalStyle) => {
        // If globalStyle wasn't set from style, use generated one
        if (!currentGlobalStyle && parsed.global_style) {
          return parsed.global_style;
        }
        return currentGlobalStyle;
      }
    },
    
    stepNames: {
      image: 'HALLOWEEN PATCHWORK IMAGE PROMPTS',
      video: 'HALLOWEEN PATCHWORK VIDEO PROMPTS',
      title: 'HALLOWEEN PATCHWORK TITLE',
      groupImage: 'HALLOWEEN PATCHWORK GROUP IMAGE',
      groupVideo: 'HALLOWEEN PATCHWORK GROUP VIDEO'
    }
  };
}

/**
 * Run the complete Halloween Patchwork generation pipeline (including titles, descriptions and hashtags)
 * @param input - The Halloween Patchwork input (array of song objects with lyrics)
 * @param options - Pipeline options
 * @returns The generated Halloween Patchwork outputs (one per song)
 */
export async function runHalloweenPatchworkPipeline(
  input: HalloweenPatchworkInput,
  options: PipelineOptions = {}
): Promise<HalloweenPatchworkOutput[]> {
  const config = createHalloweenPatchworkConfig();
  return runBasePipeline<HalloweenPatchworkInput[0], HalloweenPatchworkImagePrompt, HalloweenPatchworkVideoPrompt, HalloweenPatchworkOutput>(
    input,
    config,
    options
  );
}

