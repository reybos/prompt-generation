/**
 * Script Prompt
 * Generates a script for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';

const scriptPromptTemplate: string = `
You are a scriptwriter for a children's YouTube channel that creates short educational videos (Shorts, 30–60 seconds) for kids aged 2–6.

Write a very simple, bright, and positive script for such a video — using short lines, a clear and easy-to-follow plot, interactive elements (such as a question for the child), and ideas.

Important requirements:

Create a short, simple story where all scenes are logically connected and follow one another, forming a mini-adventure or journey. The story should have a clear beginning, middle, and end, with the same main character(s) or a group of characters moving through each scene. Avoid making scenes that are unrelated or disconnected from each other.

Limit the number of scenes to 3–7.

Don't use complicated words, make the script simple and fun.

CHARACTER DIVERSITY REQUIREMENTS:
- The first scene must include no more than one main character (to make the hook clear and easy to follow)
- Avoid overusing common animals. Use diverse characters: different animals (elephants, giraffes, penguins, owls, dolphins, turtles, frogs, butterflies, bees, ladybugs, etc.), magical creatures (unicorns, dragons, fairies), friendly monsters, robots, or even inanimate objects that come to life
- Consider human characters: children, friendly teachers, explorers, scientists, chefs, artists
- Mix different character types: combine animals with humans, or magical creatures with real objects
- Each character should have a unique personality trait or special ability

STORY VARIETY REQUIREMENTS:
- Avoid repetitive "searching for food" plots
- Create different story types: discovery adventures, learning journeys, problem-solving missions, creative activities, friendship stories, magical transformations, or scientific explorations
- Include unexpected elements: magical moments, surprising discoveries, funny misunderstandings, or creative solutions
- Make each story feel unique and memorable

CRITICAL You must strictly follow the classic dramatic structure for short videos:
1. Hook — the first 1–3 seconds. The most important element. It should provoke a question, surprise, confusion, smile, or intrigue. Without a hook, there is no view.
2. Build-up — gradually increasing interest, tension, or intrigue.
3. Climax — the resolution or highlight, the reason the viewer watched to the end.
4. Resolution — the final touch. Emotional satisfaction, answer to the question, or a completed meaning.

Each part of the script should correspond to these stages. The scenes in the script must clearly reflect this structure.

Return the result in the following JSON format without any markdown formatting or code blocks. The JSON must be valid and ready to parse with JSON.parse() (escape all quotes inside strings as \\"):
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