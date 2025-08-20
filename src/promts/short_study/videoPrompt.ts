// Short Study Video Prompt
// TODO: Implement short study video prompt logic

import {PromptTemplate} from '@langchain/core/prompts';

export const shortStudyVideoPrompt = new PromptTemplate({
    inputVariables: ["image_prompts"],
    template: `You are a senior video director and prompt engineer specializing in children's educational content.
Input is image prompts for a study topic ({image_prompts}).

TASK
1. Use the image prompts to generate an educational video prompt suitable for children.
2. Generate ONE educational video prompt for the topic.
3. TODO: Implement full short study video prompt logic

OUTPUT (JSON, no extra commentary):
{{ "video_prompts": [ {{ "line": "topic description", "video_prompt": "educational video generation prompt for the topic" }} ] }}

INPUT:
{image_prompts}
OUTPUT:
(return JSON exactly as described)`
});
