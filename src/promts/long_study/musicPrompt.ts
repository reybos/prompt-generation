/**
 * Music Prompt
 * Generates a detailed description for an original, wordless (instrumental) song for a children's educational video, suitable for use with an AI music generation tool.
 */

import { PromptTemplate } from '@langchain/core/prompts';

const musicPromptTemplate: string = `
You are a creative music producer for a children's educational YouTube channel (ages 2–6).
Given the video topic and script, generate a detailed description for an original, wordless (instrumental) background song that could be created using an AI music generation tool.

IMPORTANT: The description MUST NOT be more than 600 characters. This is critically important—if the description exceeds 600 characters, the prompt will not work. The music is for children, so ensure the description is concise, vivid, and age-appropriate.

The description should be suitable for generating instrumental music and must NOT include any lyrics or vocals. Focus on mood, style, tempo, and suggested instruments (e.g., ukulele, bells, marimba, piano, light acoustic, xylophone, etc.), making sure the music is appropriate for preschoolers, matches the video's atmosphere (cheerful, calm, playful, etc.), and does not distract from narration.

Tips:
- Keep the description concise but vivid.
- Specify the mood, tempo, and main instruments.
- Avoid any mention of lyrics, vocals, or singing.
- Emphasize that the music should be instrumental and suitable for young children.
- Suggest a style or genre if appropriate (e.g., playful acoustic, gentle lullaby, upbeat folk).

Return your response as a valid JSON object with a single field:
- description: A detailed, creative description of the song to generate using an AI music generation tool (no lyrics, no vocals)

Input:
* Topic: {topic}
* Script: {script}

Output (must be valid JSON object):
`;

const musicPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["topic", "script"],
    template: musicPromptTemplate
});

export {
    musicPrompt,
};