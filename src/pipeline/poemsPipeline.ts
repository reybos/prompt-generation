import { PoemsInput, PoemsOutput, PoemsImagePrompt, PoemsVideoPrompt, PoemsAdditionalFramePrompt } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { createImagePromptWithStyle } from '../promts/poems/imagePrompt.js';
import { poemsVideoPrompt, poemsTitlePrompt, logPoemsVideoPrompt, logPoemsTitlePrompt, poemsGroupImagePrompt, poemsGroupVideoPrompt, logPoemsGroupImagePrompt, logPoemsGroupVideoPrompt } from '../promts/poems/index.js';
import { PipelineConfig } from './pipelineConfig.js';
import { runBasePipeline } from './basePipeline.js';

/**
 * Create pipeline configuration for Poems
 */
function createPoemsConfig(): PipelineConfig<PoemsImagePrompt, PoemsVideoPrompt> {
  return {
    pipelineName: '📝 Generating Poems song',
    getPipelineIdentifier: () => 'poems', // Pipeline identifier for filenames and logging
    
    models: {
      image: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.3 },
      video: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.5 },
      title: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.7 },
      groupImage: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.3 },
      groupVideo: { model: 'anthropic/claude-sonnet-4.5', temperature: 0.5 }
    },
    
    prompts: {
      createImagePrompt: createImagePromptWithStyle,
      videoPrompt: poemsVideoPrompt,
      titlePrompt: poemsTitlePrompt,
      groupImagePrompt: poemsGroupImagePrompt,
      groupVideoPrompt: poemsGroupVideoPrompt
    },
    
    loggers: {
      logVideoPrompt: logPoemsVideoPrompt,
      logTitlePrompt: logPoemsTitlePrompt,
      logGroupImagePrompt: logPoemsGroupImagePrompt,
      logGroupVideoPrompt: logPoemsGroupVideoPrompt
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
          })) as PoemsVideoPrompt[];
        }
        return null;
      }
    },
    
    stepNames: {
      image: 'POEMS IMAGE PROMPTS',
      video: 'POEMS VIDEO PROMPTS',
      title: 'POEMS TITLE',
      groupImage: 'POEMS GROUP IMAGE',
      groupVideo: 'POEMS GROUP VIDEO'
    }
  };
}

/**
 * Run the complete Poems song generation pipeline (including titles)
 * @param input - The Poems input (array of song objects with lyrics)
 * @param options - Pipeline options
 * @returns The generated Poems outputs (one per song)
 */
export async function runPoemsPipeline(
  input: PoemsInput,
  options: PipelineOptions = {}
): Promise<PoemsOutput[]> {
  const config = createPoemsConfig();
  return runBasePipeline<PoemsInput[0], PoemsImagePrompt, PoemsVideoPrompt, PoemsOutput>(
    input,
    config,
    options
  );
}
