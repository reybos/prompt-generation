/**
 * Script Prompt
 * Generates a script for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';

const scriptPromptTemplate: string = `
You are a scriptwriter for a children's YouTube channel that creates short educational videos (Shorts, 30–60 seconds) for kids aged 2–6.

Write a simple, bright, and positive script for such a video — using short lines, an easy-to-follow plot, interactive elements (such as a question for the child), and ideas for 3–5 animated scenes.

Important requirements:

Use a variety of characters, objects, and situations — don't limit yourself to just one hero or type of object. For each new topic, invent original characters (these can be any animals, children, imaginary creatures, toys, objects, professional characters, etc.) as well as new settings and environments. Make sure the ideas are diverse and don't repeat from video to video.
The main character introduced in the introduction should appear and participate in all scenes throughout the video. This character will be described in detail in subsequent generations.
Secondary characters (friends, helpers, other animals, etc.) can appear in individual scenes as supporting characters for that specific scene only.
Don't use complicated words, make the script simple and fun.

Script structure:

All parts of the script (introduction, main scenes, and finale) should be included as elements of the "scenes" array, in order:
- The first element (index 0) is the introduction (greeting with main character)
- The next 2–4 elements are the main scenes (main character + secondary characters)
- The last element is the finale (question or call to action for the child)

Return the result in the following JSON format without any markdown formatting or code blocks:
{{
 "topic": "...",
 "scenes": [
   {{
     "title": "...",
     "description": "...",
     "narration": "..."
   }},
   // ... main scenes ...
   {{
     "title": "...",
     "description": "...",
     "narration": "..."
   }}
 ]
}}

Example 1: Video topic: "Counting to 3"
{{
 "topic": "Counting to 3",
 "scenes": [
   {{
     "title": "Rizzo the Raccoon Greets",
     "description": "A friendly raccoon appears on a sunny meadow and waves hello",
     "narration": "Hi! I'm Rizzo! Let's learn to count together!"
   }},
   {{
     "title": "Finding One Apple",
     "description": "Rizzo the raccoon finds one big red apple lying on the grass",
     "narration": "Look, I found one apple!"
   }},
   {{
     "title": "Bird Brings Second Apple",
     "description": "A yellow bird flies in and drops a second apple next to Rizzo, who looks excited",
     "narration": "Now there are two! My bird friend brought another one!"
   }},
   {{
     "title": "Frog Brings Third Apple",
     "description": "A green frog hops in carrying a third apple, Rizzo claps his paws happily",
     "narration": "And now there are three apples! Thank you, frog friend!"
   }},
   {{
     "title": "Counting Together",
     "description": "Rizzo points to each apple one by one and counts them aloud",
     "narration": "Let's count together: one, two, three!"
   }},
   {{
     "title": "Question for Kids",
     "description": "Rizzo smiles and points toward the viewer",
     "narration": "How many apples can you find at home? Tell me!"
   }}
 ]
}}

Example 2: Video topic: "Learning Shapes"
{{
 "topic": "Learning Shapes",
 "scenes": [
   {{
     "title": "Dotty the Robot Arrives",
     "description": "A small, cheerful robot girl rolls down a colorful path and waves",
     "narration": "Hi! I'm Dotty! Today we'll find fun shapes around us!"
   }},
   {{
     "title": "Finding a Circle",
     "description": "Dotty picks up a red circle from the ground and examines it closely",
     "narration": "Here's a red circle — it's round like a ball!"
   }},
   {{
     "title": "Discovering a Square",
     "description": "Dotty notices a blue square hanging on a tree branch and carefully takes it down",
     "narration": "And this is a blue square — it has four equal sides!"
   }},
   {{
     "title": "Triangle in the Grass",
     "description": "Dotty searches in the grass and finds a yellow triangle hiding there",
     "narration": "A yellow triangle was hiding here — it has three corners!"
   }},
   {{
     "title": "Showing All Shapes",
     "description": "Dotty holds up all three shapes and displays them proudly",
     "narration": "Let's repeat: circle, square, triangle!"
   }},
   {{
     "title": "Challenge for Kids",
     "description": "Dotty spins around excitedly and points to the viewer",
     "narration": "What shapes can you find at home? Take a look around!"
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