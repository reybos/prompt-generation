/**
 * Halloween prompts module
 * Exports all prompt templates for Halloween pipeline
 */

export { imagePrompt, createImagePromptWithStyle } from './imagePrompt.js';
export { 
    halloweenTitlePrompt, 
    logTitlePrompt
} from './titleDescPrompt.js';
export { halloweenVideoPrompt, logVideoPrompt } from './videoPrompt.js';
export { 
    halloweenGroupImagePrompt,
    halloweenGroupVideoPrompt,
    logHalloweenGroupImagePrompt,
    logHalloweenGroupVideoPrompt
} from './groupFramesPrompt.js'; 