/**
 * Title and Description Prompt
 * Generates a highly SEO-optimized title and long-form description for a children's educational YouTube video
 */

import { PromptTemplate } from '@langchain/core/prompts';

const titleDescPromptTemplate: string = `
You are an expert YouTube creator and SEO strategist specializing in **children's educational content for ages 2–6**.

Your task is to create a highly engaging and SEO-optimized TITLE and DESCRIPTION for a YouTube video based on the provided topic and script.

Goals:

1. **SEO Optimization**:
   - Naturally include highly relevant keywords and phrases parents search for, such as:
     "learning colors for toddlers", "educational video for preschoolers", "fun learning for kids", "animated learning video", "early learning", "preschool activities".
   - Place the main keyword at or near the start of the title.
   - Avoid keyword stuffing; ensure natural, readable flow.
   - Include variations of keywords in the description for better discoverability.

2. **Title**:
   - Catchy, descriptive, and age-appropriate (max 60 characters).
   - Clearly communicates the main topic and learning focus.
   - Engaging for both parents and kids.

3. **Description**:
   - Up to 1,500 characters.
   - Provide a detailed summary of the video, including:
     - Activities, actions, or interactions children will engage in.
     - Characters, objects, and environments.
     - Learning goals and skills developed (colors, counting, shapes, vocabulary, problem-solving).
   - Use joyful, warm, and playful language appealing to parents and children.
   - Structure into 2–4 short, easy-to-read paragraphs.
   - Naturally integrate relevant keywords throughout.
   - Emphasize educational value, fun, and engagement.

4. **Tone**:
   - Warm, cheerful, and informative.
   - Suitable for parents looking for safe, educational, and entertaining content.

Return ONLY a valid JSON object with two properties: "title" and "description".

Input:
* Topic: {topic}
* Script: {script}

Output (valid JSON):
`;

const titleDescPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["topic", "script"],
    template: titleDescPromptTemplate
});

export {
    titleDescPrompt,
};