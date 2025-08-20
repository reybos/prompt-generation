// Short Study Hashtags Prompt
// TODO: Implement short study hashtags prompt logic

import {PromptTemplate} from '@langchain/core/prompts';

export const shortStudyHashtagsPrompt = new PromptTemplate({
    inputVariables: ["topicDescription", "videoPrompt"],
    template: `You are a senior content creator specializing in children's educational content.
Input is a study topic description ({topicDescription}) and video prompt ({videoPrompt}).

TASK
1. Use the topic description and video prompt to generate relevant hashtags for educational content.
2. Generate hashtags suitable for children's educational content.
3. TODO: Implement full short study hashtags prompt logic

OUTPUT (plain text, no extra commentary):
#educational #children #learning #topic #fun #kids

INPUT:
Topic: {topicDescription}
Video Prompt: {videoPrompt}
OUTPUT:
(return hashtags as plain text, no JSON formatting)`
});
