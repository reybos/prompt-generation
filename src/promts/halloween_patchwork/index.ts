/**
 * Halloween Patchwork prompts module
 * Exports all prompt templates for Halloween Patchwork pipeline
 */

export { imagePrompt, createImagePrompt } from './imagePrompt.js';
export { 
    halloweenPatchworkTitlePrompt, 
    logTitlePrompt
} from './titleDescPrompt.js';
export { halloweenPatchworkVideoPrompt, logVideoPrompt } from './videoPrompt.js';
export { 
    halloweenPatchworkGroupImagePrompt,
    halloweenPatchworkGroupVideoPrompt,
    logHalloweenPatchworkGroupImagePrompt,
    logHalloweenPatchworkGroupVideoPrompt
} from './groupFramesPrompt.js';

