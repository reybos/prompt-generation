/* START GENAI */
/**
 * Pipeline configuration types and interfaces
 * Defines the structure for configuring different pipeline types
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { LLMOptions } from '../types/config.js';
import { PipelineOptions } from '../types/pipeline.js';
import { AdditionalFrameResult } from './generateGroupFrames.js';

/**
 * Model and temperature configuration for a pipeline step
 */
export interface StepModelConfig {
  model: string;
  temperature: number;
}

/**
 * Function to format image prompts for video generation step
 */
export type ImagePromptsFormatter = (prompts: any[]) => string;

/**
 * Function to create params for video generation step
 */
export type VideoParamsBuilder = (imagePromptsFormatted: string) => Record<string, any>;

/**
 * Function to parse video prompts from LLM response
 */
export type VideoPromptsParser<T> = (
  parsed: any,
  options: PipelineOptions
) => T[] | null;

/**
 * Function to log video prompt (for debugging)
 */
export type LogVideoPromptFn = (...args: any[]) => void;

/**
 * Function to log title prompt (for debugging)
 */
export type LogTitlePromptFn = (...args: any[]) => void;

/**
 * Configuration for a complete pipeline
 */
export interface PipelineConfig<TImagePrompt, TVideoPrompt> {
  // Pipeline name for logging
  pipelineName: string;
  
  // Pipeline identifier for filenames and logging (can be fixed or from options)
  getPipelineIdentifier: (options: PipelineOptions) => string;
  
  // Model configurations
  models: {
    image: StepModelConfig;
    video: StepModelConfig;
    title: StepModelConfig;
    groupImage: StepModelConfig;
    groupVideo: StepModelConfig;
  };
  
  // Prompt templates
  prompts: {
    createImagePrompt?: (style: string) => PromptTemplate; // Optional if skipImageStep is true
    videoPrompt: PromptTemplate;
    titlePrompt: PromptTemplate;
    groupImagePrompt: PromptTemplate;
    groupVideoPrompt: PromptTemplate;
  };
  
  // Logging functions
  loggers: {
    logVideoPrompt: LogVideoPromptFn;
    logTitlePrompt: LogTitlePromptFn;
    logGroupImagePrompt: LogVideoPromptFn;
    logGroupVideoPrompt: LogVideoPromptFn;
  };
  
  // Data formatting and parsing
  formatters: {
    formatImagePromptsForVideo?: ImagePromptsFormatter; // Optional if skipImageStep is true
    buildVideoParams?: VideoParamsBuilder; // Optional, defaults to { image_prompts }
    buildVideoParamsFromLyrics?: (songLyrics: string) => Record<string, any>; // For when skipImageStep is true
  };
  
  parsers: {
    parseVideoPrompts: VideoPromptsParser<TVideoPrompt>;
  };
  
  // Post-processing hooks
  postProcessImagePrompts?: (prompts: TImagePrompt[]) => TImagePrompt[];
  postProcessVideoPrompts?: (prompts: TVideoPrompt[]) => TVideoPrompt[];
  postProcessAdditionalFrames?: (frames: AdditionalFrameResult[]) => AdditionalFrameResult[];
  
  // Step skipping options
  skipImageStep?: boolean; // If true, skip image prompt generation
  skipTitleStep?: boolean; // If true, skip title generation (for future flexibility)
  
  // Step names for tracking
  stepNames: {
    image: string;
    video: string;
    title: string;
    groupImage: string;
    groupVideo: string;
  };
}

/* END GENAI */

