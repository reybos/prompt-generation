/**
 * Title and Description Prompt for Song with Animals
 * Generates title and description for children's songs with animal characters
 */

import {PromptTemplate} from '@langchain/core/prompts';

const songWithAnimalsTitleDescPromptTemplate: string = `You are a social media expert specializing in children's content.
Input is a segment from a children's song with animal characters ({songLyrics}) and its corresponding video prompt ({videoPrompt}).

TASK
Generate an engaging title and description for a children's video featuring this song segment and video content.

TITLE REQUIREMENTS:
• Catchy and fun for children
• Include the main animal character(s) from this segment
• 5-8 words maximum
• Use action words when possible
• Reflect the video content described in the video prompt

DESCRIPTION REQUIREMENTS:
• Engaging for parents and children
• Mention the educational value (learning animal sounds, etc.)
• Include emojis to make it fun
• 2-3 sentences maximum
• Highlight the interactive/entertaining aspects of this segment
• Reference the visual elements from the video prompt

OUTPUT (JSON, no extra commentary):
{{
  "title": "catchy title here",
  "description": "engaging description with emojis here"
}}

INPUT:
Song Lyrics: {songLyrics}
Video Prompt: {videoPrompt}
Global Style: {globalStyle}

OUTPUT:
(return JSON exactly as described)`;

const songWithAnimalsTitleDescPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["songLyrics", "videoPrompt", "globalStyle"],
    template: songWithAnimalsTitleDescPromptTemplate
});

// Backward compatible version for lyrics-only input
const songWithAnimalsTitleDescPromptLyricsOnlyTemplate: string = `You are a social media expert specializing in children's content.
Input is a segment from a children's song with animal characters ({songLyrics}).

TASK
Generate an engaging title and description for a children's video featuring this song segment.

TITLE REQUIREMENTS:
• Catchy and fun for children
• Include the main animal character(s) from this segment
• 12-14 words maximum
• Use action words when possible

DESCRIPTION REQUIREMENTS:
• Engaging for parents and children
• Mention the educational value (learning animal sounds, etc.)
• Include emojis to make it fun
• 3-4 sentences maximum
• Highlight the interactive/entertaining aspects of this segment

OUTPUT (JSON, no extra commentary):
{{
  "title": "catchy title here",
  "description": "engaging description with emojis here"
}}

INPUT:
{songLyrics}

OUTPUT:
(return JSON exactly as described)`;

const songWithAnimalsTitleDescPromptLyricsOnly: PromptTemplate = new PromptTemplate({
    inputVariables: ["songLyrics"],
    template: songWithAnimalsTitleDescPromptLyricsOnlyTemplate
});

export {
    songWithAnimalsTitleDescPrompt,
    songWithAnimalsTitleDescPromptLyricsOnly,
}; 