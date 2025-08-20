// Short Study Title and Description Prompt
// TODO: Implement short study title and description prompt logic

import {PromptTemplate} from '@langchain/core/prompts';

export const shortStudyTitleDescPrompt = new PromptTemplate({
    inputVariables: ["topicDescription", "videoPrompt"],
    template: `You are a senior content creator specializing in children's educational content.
Input is a study topic description ({topicDescription}) and video prompt ({videoPrompt}).

TASK
1. Use the topic description and video prompt to generate an engaging title and description for children.
2. Generate ONE title and description suitable for educational content.
3. TODO: Implement full short study title and description prompt logic

OUTPUT (JSON, no extra commentary):
{{ "title": "engaging title for children", "description": "educational description for children" }}

INPUT:
Topic: {topicDescription}
Video Prompt: {videoPrompt}
OUTPUT:
(return JSON exactly as described)`
});
