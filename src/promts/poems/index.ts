/**
 * Poems prompts module
 * Exports all prompt templates for Poems pipeline
 */

export { imagePrompt, createImagePromptWithStyle } from './imagePrompt.js';
export { 
    poemsTitlePrompt, 
    logPoemsTitlePrompt
} from './titleDescPrompt.js';
export { poemsVideoPrompt, logPoemsVideoPrompt } from './videoPrompt.js';
// Note: Group frames are not supported for poems pipeline

