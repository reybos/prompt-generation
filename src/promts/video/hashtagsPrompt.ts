/**
 * Hashtags Prompt
 * Generates hashtags for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';

const hashtagsPromptTemplate: string = `
You are a YouTube SEO specialist for a children's educational channel (ages 2–6).
Given the topic, script, and channel name, generate a list of 7–12 relevant hashtags for a YouTube Shorts video.

Rules:
* Mix general hashtags (format, age, genre) and unique, video-specific tags (topic, activity, objects, emotions, actions, interactive elements, and character names if present in the script).
* For each video, make the selection a bit different: don't repeat the same set in every video.
* Use only lowercase English words, no special characters except #.
* Separate hashtags with spaces.

Input:
* Topic: {topic}
* Script: {script}
* Channel name: {channel}

Output:
#shorts #... #... #... (7-12 hashtags)
`;

const hashtagsPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["topic", "script", "channel"],
    template: hashtagsPromptTemplate
});

export {
    hashtagsPrompt,
};