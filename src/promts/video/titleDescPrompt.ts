/**
 * Title and Description Prompt
 * Generates a title and description for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';

const titleDescPromptTemplate: string = `
You are an expert YouTube creator for a children's educational channel (ages 2–6).
Given a video topic, a short script or summary, and the main character (if any), do the following:
* Create a catchy, age-appropriate, and original video title (max 60 characters). Vary the structure and vocabulary for each new video.
* Write a short, engaging, and unique description (up to 200 characters). Briefly summarize what happens in the video, focusing on the main activity, objects, and characters. Do not include any direct call to action or prompts for the viewer to do something.
* Use a warm, joyful, and simple tone that appeals to both kids and parents. Avoid complicated words and repetitive phrases.
* If there's a main character, naturally mention them in the description—but not always in the same way.

Return your response as a valid JSON object with "title" and "description" properties.

Input:
* Topic: {topic}
* Script: {script}
* Main character (if any): {character}

Output (must be valid JSON):
`;

const titleDescPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["topic", "script", "character"],
    template: titleDescPromptTemplate
});

export {
    titleDescPrompt,
};