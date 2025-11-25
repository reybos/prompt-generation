/**
 * Poems Direct Video prompts module
 * Exports all prompt templates for Poems Direct Video pipeline
 */

export { poemsDirectVideoVideoPrompt, logPoemsDirectVideoVideoPrompt } from './videoPrompt.js';
export { 
    poemsDirectVideoTitlePrompt, 
    logPoemsDirectVideoTitlePrompt
} from './titleDescPrompt.js';
// Note: Additional frames are not supported for direct video pipeline
// as they require image prompts which are not generated

