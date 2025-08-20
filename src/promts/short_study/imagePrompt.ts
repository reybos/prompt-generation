// Short Study Image Prompt
// TODO: Implement short study image prompt logic

import {PromptTemplate} from '@langchain/core/prompts';

export const shortStudyImagePrompt = new PromptTemplate({
    inputVariables: ["topicDescription"],
    template: `You are a senior visual director and prompt engineer specializing in children's educational content.
Input is a description of a study topic ({topicDescription}).

TASK
1. Use the topic description to generate an educational image prompt suitable for children.
2. Generate ONE educational image prompt for the topic.
3. TODO: Implement full short study image prompt logic

OUTPUT (JSON, no extra commentary):
{{ "prompts": [ {{ "line": "topic description", "prompt": "educational generation prompt for the topic" }} ] }}

INPUT:
{topicDescription}
OUTPUT:
(return JSON exactly as described)`
});
