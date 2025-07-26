/**
 * Script Prompt
 * Generates a script for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';

const scriptPromptTemplate: string = `
You are a scriptwriter for a children's YouTube channel that creates short educational videos (Shorts, 30–60 seconds) for kids aged 2–6.

Write a simple, bright, and positive script for such a video — using short lines, an easy-to-follow plot, interactive elements (such as a question for the child), and ideas.

Important requirements:

Create a short, simple story where all scenes are logically connected and follow one another, forming a mini-adventure or journey. The story should have a clear beginning, middle, and end, with the same main character(s) or a group of characters moving through each scene. Avoid making scenes that are unrelated or disconnected from each other.

Limit the number of scenes to 3–4, so that each scene represents a meaningful step in the story (introduction, development, climax, resolution).

Don't use complicated words, make the script simple and fun.

CRITICAL You must strictly follow the classic dramatic structure for short videos:
1. Hook — the first 1–3 seconds. The most important element. It should provoke a question, surprise, confusion, smile, or intrigue. Without a hook, there is no view.
2. Build-up — gradually increasing interest, tension, or intrigue.
3. Climax — the resolution or highlight, the reason the viewer watched to the end.
4. Resolution — the final touch. Emotional satisfaction, answer to the question, or a completed meaning.

Each part of the script should correspond to these stages. The scenes in the script must clearly reflect this structure.

Script structure:

All parts of the script (introduction, main scenes, and finale) should be included as elements of the "scenes" array, in order:
- The first element (index 0) is the introduction (general greeting or introduction to the topic, delivered as a voice-over narration)
- The next 1–2 elements are the main scenes (can include different situations, but must be part of the same story)
- The last element is the finale (question or call to action for the child, and/or resolution of the story)

Return the result in the following JSON format without any markdown formatting or code blocks:
{{
 "topic": "...",
 "scenes": [
   {{
     "description": "...",
     "narration": "..."
   }},
   // ... main scenes ...
   {{
     "description": "...",
     "narration": "..."
   }}
 ]
}}

Video topic: {topic}`;

const scriptPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["topic"],
    template: scriptPromptTemplate
});

export {
    scriptPrompt,
};