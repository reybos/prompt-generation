/**
 * Prompts module
 * Exports all prompt templates
 */

import { narrationPrompt } from './long_study/narrationPrompt.js';
import { enhanceMediaPrompt } from './long_study/enhanceMediaPrompt.js';
import { mediaPrompt } from './long_study/mediaPrompt.js';
import { scriptPrompt } from './long_study/scriptPrompt.js';
import { titleDescPrompt } from './long_study/titleDescPrompt.js';
import { musicPrompt } from './long_study/musicPrompt.js';
import { hashtagsPrompt } from './long_study/hashtagsPrompt.js';
import { characterPrompt } from './long_study/characterPrompt.js';
import { shortenVideoPrompt } from './long_study/shortenVideoPrompt.js';
import { imagePrompt, songWithAnimalsTitlePrompt, songWithAnimalsVideoPrompt, logVideoPrompt, logTitlePrompt, songWithAnimalsGroupImagePrompt, songWithAnimalsGroupVideoPrompt, logSongWithAnimalsGroupImagePrompt, logSongWithAnimalsGroupVideoPrompt } from './song_with_animals/index.js';
import { imagePrompt as halloweenImagePrompt, halloweenTitlePrompt, halloweenVideoPrompt, logVideoPrompt as halloweenLogVideoPrompt, logTitlePrompt as halloweenLogTitlePrompt, halloweenGroupImagePrompt, halloweenGroupVideoPrompt, logHalloweenGroupImagePrompt, logHalloweenGroupVideoPrompt } from './halloween_dance/index.js';
import { imagePrompt as halloweenTransformImagePrompt, halloweenTransformTitlePrompt, halloweenTransformVideoPrompt, logVideoPrompt as halloweenTransformLogVideoPrompt, logTitlePrompt as halloweenTransformLogTitlePrompt, halloweenTransformGroupImagePrompt, halloweenTransformGroupVideoPrompt, logHalloweenTransformGroupImagePrompt, logHalloweenTransformGroupVideoPrompt } from './halloween_transform/index.js';
import { imagePrompt as halloweenTransformTwoFrameImagePrompt, halloweenTransformTwoFrameTitlePrompt, halloweenTransformTwoFrameVideoPrompt, logVideoPrompt as halloweenTransformTwoFrameLogVideoPrompt, logTitlePrompt as halloweenTransformTwoFrameLogTitlePrompt, halloweenTransformTwoFrameGroupImagePrompt, halloweenTransformTwoFrameGroupVideoPrompt, logHalloweenTransformTwoFrameGroupImagePrompt, logHalloweenTransformTwoFrameGroupVideoPrompt } from './halloween_transform_two_frame/index.js';
import { imagePrompt as poemsImagePrompt, poemsTitlePrompt, poemsVideoPrompt, logPoemsVideoPrompt, logPoemsTitlePrompt, poemsGroupImagePrompt, poemsGroupVideoPrompt, logPoemsGroupImagePrompt, logPoemsGroupVideoPrompt } from './poems/index.js';
import { shortStudyVideoPrompt, shortStudyTitleDescPrompt, shortStudyHashtagsPrompt, shortStudySongPrompt, logTitleDescPrompt as shortStudyLogTitleDescPrompt } from './short_study/index.js';

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
    songWithAnimalsTitlePrompt,
    songWithAnimalsVideoPrompt,
    logVideoPrompt,
    logTitlePrompt,
    songWithAnimalsGroupImagePrompt,
    songWithAnimalsGroupVideoPrompt,
    logSongWithAnimalsGroupImagePrompt,
    logSongWithAnimalsGroupVideoPrompt,
    halloweenImagePrompt,
    halloweenTitlePrompt,
    halloweenVideoPrompt,
    halloweenLogVideoPrompt,
    halloweenLogTitlePrompt,
    halloweenGroupImagePrompt,
    halloweenGroupVideoPrompt,
    logHalloweenGroupImagePrompt,
    logHalloweenGroupVideoPrompt,
    halloweenTransformImagePrompt,
    halloweenTransformTitlePrompt,
    halloweenTransformVideoPrompt,
    halloweenTransformLogVideoPrompt,
    halloweenTransformLogTitlePrompt,
    halloweenTransformGroupImagePrompt,
    halloweenTransformGroupVideoPrompt,
    logHalloweenTransformGroupImagePrompt,
    logHalloweenTransformGroupVideoPrompt,
    halloweenTransformTwoFrameImagePrompt,
    halloweenTransformTwoFrameTitlePrompt,
    halloweenTransformTwoFrameVideoPrompt,
    halloweenTransformTwoFrameLogVideoPrompt,
    halloweenTransformTwoFrameLogTitlePrompt,
    halloweenTransformTwoFrameGroupImagePrompt,
    halloweenTransformTwoFrameGroupVideoPrompt,
    logHalloweenTransformTwoFrameGroupImagePrompt,
    logHalloweenTransformTwoFrameGroupVideoPrompt,
    poemsImagePrompt,
    poemsTitlePrompt,
    poemsVideoPrompt,
    logPoemsVideoPrompt,
    logPoemsTitlePrompt,
    poemsGroupImagePrompt,
    poemsGroupVideoPrompt,
    logPoemsGroupImagePrompt,
    logPoemsGroupVideoPrompt,
    shortStudyVideoPrompt,
    shortStudyTitleDescPrompt,
    shortStudyHashtagsPrompt,
    shortStudySongPrompt,
    shortStudyLogTitleDescPrompt,
};