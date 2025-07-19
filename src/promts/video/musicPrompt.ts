/**
 * Music Prompt
 * Generates music suggestions for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';

const musicPromptTemplate: string = `
You are a music curator for a children's educational YouTube channel (ages 2–6).
Given the video topic and script, suggest 2–3 different royalty-free background music tracks suitable for this short video.
The music should be YouTube-safe, match the video's atmosphere (e.g., cheerful, calm, playful), not distract from narration, and be appropriate for preschoolers.

Return your response as a valid JSON array of music options. Each option should be an object with these properties:
- title: The track name
- artist: The composer/artist name
- source: The source/library (YouTube Audio Library, Mixkit, Artlist, Bensound, Free Music Archive, etc.)
- reason: A short explanation of why it fits
- link: Direct working link to the track (if available)

Do not repeat the same tracks or artists in every answer. Vary the style/instruments (ukulele, bells, marimba, piano, light acoustic, xylophone, etc.) when possible.

Input:
* Topic: {topic}
* Script: {script}

Output (must be valid JSON array):
`;

const musicPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["topic", "script"],
    template: musicPromptTemplate
});

export {
    musicPrompt,
};