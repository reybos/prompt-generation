/**
 * Hashtags Prompt for Song with Animals
 * Generates hashtags for children's songs with animal characters
 */

import {PromptTemplate} from '@langchain/core/prompts';

const songWithAnimalsHashtagsPromptTemplate: string = `You are a social media expert specializing in children's content.
Input is a segment from a children's song with animal characters ({songLyrics}).

TASK
Generate relevant hashtags for a children's video featuring this song segment.

HASHTAG REQUIREMENTS:
• Include educational hashtags (learning, kids, education)
• Include animal-related hashtags based on the song segment
• Include fun/entertainment hashtags
• Include age-appropriate hashtags (toddlers, preschoolers)
• Include parent-focused hashtags
• 7-10 hashtags total
• Mix of popular and niche hashtags
• No spaces in hashtags, use camelCase if needed

EXAMPLES:
#shorts ...

OUTPUT:
Return only the hashtags as a single string, separated by spaces, no extra text or commentary.

INPUT:
{songLyrics}

OUTPUT:
(return hashtags as space-separated string)`;

const songWithAnimalsHashtagsPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["songLyrics"],
    template: songWithAnimalsHashtagsPromptTemplate
});

export {
    songWithAnimalsHashtagsPrompt,
}; 