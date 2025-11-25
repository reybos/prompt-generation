/**
 * Halloween Transform prompts module
 * Exports all prompt templates for Halloween Transform pipeline
 */

export { imagePrompt, createImagePromptWithStyle } from './imagePrompt.js';
export { 
    halloweenTransformTitlePrompt, 
    logTitlePrompt,
    halloweenTransformLogTitlePrompt
} from './titleDescPrompt.js';
export { 
    halloweenTransformVideoPrompt, 
    logVideoPrompt,
    halloweenTransformLogVideoPrompt
} from './videoPrompt.js';
export { 
    halloweenTransformGroupImagePrompt,
    halloweenTransformGroupVideoPrompt,
    logHalloweenTransformGroupImagePrompt,
    logHalloweenTransformGroupVideoPrompt
} from './groupFramesPrompt.js'; 