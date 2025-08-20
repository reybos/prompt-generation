// Horror Title & Description Prompt
// TODO: Implement horror title and description prompt logic

import {PromptTemplate} from '@langchain/core/prompts';

export const horrorTitleDescPrompt = new PromptTemplate({
    inputVariables: ["animalDescription", "videoPrompt"],
    template: `You are a senior content creator specializing in horror content.
Input includes animal description ({animalDescription}) and video prompt ({videoPrompt}).

TASK
1. Generate horror-themed title and description for the animal content.
2. TODO: Implement full horror title/description prompt logic

OUTPUT (JSON, no extra commentary):
{{ "title": "horror title", "description": "horror description" }}

INPUT:
Animal Description: {animalDescription}
Video Prompt: {videoPrompt}

OUTPUT:
(return JSON exactly as described)`
});
