/**
 * Prompts module
 * Exports all prompt templates
 */

import { narrationPrompt } from './video/narrationPrompt.js';
import { enhanceMediaPrompt } from './video/enhanceMediaPrompt.js';
import { mediaPrompt } from './video/mediaPrompt.js';
import { scriptPrompt } from './video/scriptPrompt.js';
import { titleDescPrompt } from './video/titleDescPrompt.js';
import { musicPrompt } from './video/musicPrompt.js';
import { hashtagsPrompt } from './video/hashtagsPrompt.js';
import { characterPrompt } from './video/characterPrompt.js';
import { shortenVideoPrompt } from './video/shortenVideoPrompt.js';
import { imagePrompt, songWithAnimalsTitleDescPrompt, songWithAnimalsHashtagsPrompt, songWithAnimalsVideoPrompt } from './song_with_animals/index.js';

export {
    narrationPrompt,
    enhanceMediaPrompt,
    mediaPrompt,
    scriptPrompt,
    titleDescPrompt,
    musicPrompt,
    hashtagsPrompt,
    characterPrompt,
    shortenVideoPrompt,
    imagePrompt,
    songWithAnimalsTitleDescPrompt,
    songWithAnimalsHashtagsPrompt,
    songWithAnimalsVideoPrompt,
};