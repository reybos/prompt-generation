// Horror Video Prompt
// TODO: Implement horror video prompt logic

import {PromptTemplate} from '@langchain/core/prompts';

export const horrorVideoPrompt = new PromptTemplate({
    inputVariables: ["image_prompts"],
    template: `You are a senior video director and prompt engineer specializing in horror content.
Input includes image prompts ({image_prompts}).

TASK
1. Generate ONE horror-themed video prompt for the image prompt.
2. TODO: Implement full horror video prompt logic

OUTPUT (JSON, no extra commentary):
{{ "video_prompts": [ {{ "line": "animal description", "video_prompt": "horror video prompt for the animal" }} ] }}

INPUT:
Image Prompts: {image_prompts}

OUTPUT:
(return JSON exactly as described)`
});
