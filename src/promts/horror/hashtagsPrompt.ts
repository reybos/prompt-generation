// Horror Hashtags Prompt
// TODO: Implement horror hashtags prompt logic

import {PromptTemplate} from '@langchain/core/prompts';

export const horrorHashtagsPrompt = new PromptTemplate({
    inputVariables: ["animalDescription", "videoPrompt"],
    template: `You are a senior content creator specializing in horror content.
Input includes animal description ({animalDescription}) and video prompt ({videoPrompt}).

TASK
1. Generate horror-themed hashtags for the animal content.
2. TODO: Implement full horror hashtags prompt logic

OUTPUT:
Return a string of hashtags separated by spaces, no JSON formatting.

INPUT:
Animal Description: {animalDescription}
Video Prompt: {videoPrompt}

OUTPUT:
#horror #content #hashtags`
});
