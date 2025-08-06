/**
 * Title and Description Prompt for Song with Animals
 * Generates title and description for children's songs with animal characters
 */

import {PromptTemplate} from '@langchain/core/prompts';

const songWithAnimalsTitleDescPromptTemplate: string = `You are a social media expert specializing in children's content.
Input is a children's song with animal characters ({songLyrics}).

TASK
Generate an engaging title and description for a children's video featuring this song.

TITLE REQUIREMENTS:
• Catchy and fun for children
• Include the main animal character(s)
• 5-8 words maximum
• Use action words when possible

DESCRIPTION REQUIREMENTS:
• Engaging for parents and children
• Mention the educational value (learning animal sounds, etc.)
• Include emojis to make it fun
• 2-3 sentences maximum
• Highlight the interactive/entertaining aspects

OUTPUT (JSON, no extra commentary):
{{
  "title": "catchy title here",
  "description": "engaging description with emojis here"
}}

INPUT:
{songLyrics}

OUTPUT:
(return JSON exactly as described)`;

const songWithAnimalsTitleDescPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["songLyrics"],
    template: songWithAnimalsTitleDescPromptTemplate
});

export {
    songWithAnimalsTitleDescPrompt,
}; 