// Horror Image Prompt
// TODO: Implement horror image prompt logic

import {PromptTemplate} from '@langchain/core/prompts';

export const horrorImagePrompt = new PromptTemplate({
    inputVariables: ["animalDescription"],
    template: `You are a senior visual director and prompt engineer specializing in horror content.
Input is a description of a horror animal ({animalDescription}).

TASK
1. Use the animal description to generate a horror-themed image prompt.
2. Generate ONE horror-themed image prompt for the animal.
3. TODO: Implement full horror image prompt logic

OUTPUT (JSON, no extra commentary):
{{ "prompts": [ {{ "line": "animal description", "prompt": "horror generation prompt for the animal" }} ] }}

INPUT:
{animalDescription}
OUTPUT:
(return JSON exactly as described)`
});

