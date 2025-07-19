import { PromptTemplate } from '@langchain/core/prompts';

const shortenVideoPromptTemplate: string = `
You are an expert at editing and condensing prompts for video generation for children's educational videos.

You will be given a video prompt that is too long (over 2000 characters). Your task is to shorten this video prompt to be under 1700 characters, while preserving as much of the original meaning, visual detail, and intent as possible. Do not remove important visual elements, but prioritize brevity and clarity. If needed, rephrase, combine sentences, and remove redundant or overly detailed descriptions, but keep the core idea and all critical visual information.

Do NOT add any new information. Do NOT change the meaning or intent of the prompt. Only shorten and clarify.

Return ONLY the shortened video prompt as plain text, with no markdown, code blocks, or extra formatting.

CRITICAL: Each video_prompt and image_prompt in the output must be no more than 1500 characters in length.

Here is the original video prompt:
{video_prompt}
`;

const shortenVideoPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["video_prompt"],
    template: shortenVideoPromptTemplate
});

export { shortenVideoPrompt }; 