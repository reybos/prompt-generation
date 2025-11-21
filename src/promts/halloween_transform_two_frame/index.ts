/**
 * Halloween Transform Two Frame prompts module
 * Exports all prompt templates for Halloween Transform Two Frame pipeline
 */

export { imagePrompt, createImagePromptWithStyle } from './imagePrompt.js';
export { 
    halloweenTransformTwoFrameTitlePrompt, 
    logTitlePrompt,
    halloweenTransformTwoFrameLogTitlePrompt
} from './titleDescPrompt.js';
export { 
    halloweenTransformTwoFrameVideoPrompt, 
    logVideoPrompt,
    halloweenTransformTwoFrameLogVideoPrompt
} from './videoPrompt.js';
export { 
    halloweenTransformTwoFrameGroupImagePrompt,
    halloweenTransformTwoFrameGroupVideoPrompt,
    logHalloweenTransformTwoFrameGroupImagePrompt,
    logHalloweenTransformTwoFrameGroupVideoPrompt
} from './additionalFramesPrompt.js';

