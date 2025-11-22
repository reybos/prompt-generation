import { SongWithAnimalsInput, SongWithAnimalsOutput, SongWithAnimalsImagePrompt, SongWithAnimalsVideoPrompt, SongWithAnimalsAdditionalFramePrompt } from '../types/pipeline.js';
import { PipelineOptions } from '../types/pipeline.js';
import { createImagePromptWithStyle } from '../promts/song_with_animals/imagePrompt.js';
import { getStyle } from '../promts/song_with_animals/styles/styleConfig.js';
import { songWithAnimalsVideoPrompt, songWithAnimalsTitlePrompt, logVideoPrompt, logTitlePrompt, songWithAnimalsGroupImagePrompt, songWithAnimalsGroupVideoPrompt, logSongWithAnimalsGroupImagePrompt, logSongWithAnimalsGroupVideoPrompt } from '../promts/index.js';
import { PipelineConfig } from './pipelineConfig.js';
import { runBasePipeline } from './basePipeline.js';
import { safeJsonParse } from '../utils/index.js';

/**
 * Create pipeline configuration for song with animals
 */
function createSongWithAnimalsConfig(): PipelineConfig<SongWithAnimalsImagePrompt, SongWithAnimalsVideoPrompt> {
  return {
    pipelineName: '🎵 Generating song with animals',
    getStyleName: (options: PipelineOptions) => options.style || 'default',
    
    models: {
      image: { model: 'openai/gpt-5-chat', temperature: 0.3 },
      video: { model: 'anthropic/claude-3.7-sonnet', temperature: 0.5 },
      title: { model: 'openai/gpt-5-chat', temperature: 0.7 },
      groupImage: { model: 'anthropic/claude-3.7-sonnet', temperature: 0.6 },
      groupVideo: { model: 'anthropic/claude-3.7-sonnet', temperature: 0.5 }
    },
    
    prompts: {
      createImagePrompt: createImagePromptWithStyle,
      videoPrompt: songWithAnimalsVideoPrompt,
      titlePrompt: songWithAnimalsTitlePrompt,
      groupImagePrompt: songWithAnimalsGroupImagePrompt,
      groupVideoPrompt: songWithAnimalsGroupVideoPrompt
    },
    
    loggers: {
      logVideoPrompt: logVideoPrompt,
      logTitlePrompt: logTitlePrompt,
      logGroupImagePrompt: logSongWithAnimalsGroupImagePrompt,
      logGroupVideoPrompt: logSongWithAnimalsGroupVideoPrompt
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
          })) as SongWithAnimalsVideoPrompt[];
        }
        return null;
      }
    },
    
    globalStyle: {
      getInitial: async (style: string, options: PipelineOptions) => {
        let globalStyle = '';
        try {
          const styleConfig = getStyle(style);
          // Check if style has globalStyle property (may be added dynamically)
          if ((styleConfig as any).globalStyle) {
            globalStyle = (styleConfig as any).globalStyle;
            if (options.emitLog && options.requestId) {
              options.emitLog(`🎨 Using predefined globalStyle from ${style} style`, options.requestId);
            }
          }
        } catch (error) {
          if (options.emitLog && options.requestId) {
            options.emitLog(`⚠️ Could not load style ${style}: ${error instanceof Error ? error.message : String(error)}`, options.requestId);
          }
        }
        return globalStyle;
      },
      extractFromImageJson: (parsed, currentGlobalStyle) => {
        // Если globalStyle не был установлен из стиля, используем сгенерированный
        if (!currentGlobalStyle && parsed.global_style) {
          return parsed.global_style;
        }
        return currentGlobalStyle;
      }
    },
    
    stepNames: {
      image: 'SONG WITH ANIMALS IMAGE PROMPTS',
      video: 'SONG WITH ANIMALS VIDEO PROMPTS',
      title: 'SONG WITH ANIMALS TITLE',
      groupImage: 'SONG WITH ANIMALS GROUP IMAGE',
      groupVideo: 'SONG WITH ANIMALS GROUP VIDEO'
    }
  };
}

/**
 * Run the complete song with animals generation pipeline (including titles, descriptions and hashtags)
 * @param input - The song with animals input (array of song objects with lyrics)
 * @param options - Pipeline options
 * @returns The generated song with animals outputs (one per song)
 */
export async function runSongWithAnimalsPipeline(
  input: SongWithAnimalsInput,
  options: PipelineOptions = {}
): Promise<SongWithAnimalsOutput[]> {
  const config = createSongWithAnimalsConfig();
  return runBasePipeline<SongWithAnimalsInput[0], SongWithAnimalsImagePrompt, SongWithAnimalsVideoPrompt, SongWithAnimalsOutput>(
    input,
    config,
    options
  );
}
