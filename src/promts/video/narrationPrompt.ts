/**
 * Narration Prompt
 * Generates detailed narration text for each scene of a children's educational video, based on the script and enhanced media prompts.
 */

import { PromptTemplate } from '@langchain/core/prompts';

const narrationPromptTemplate: string = `
You are a children's video scriptwriter and voiceover specialist.

You will be given:
* The full script of a short educational video for children aged 2–6 (in JSON format, with introduction, scenes, and finale, each with a short narration field).
* A list of enhanced media prompts for each scene (in JSON array format), describing the visual details, actions, and environment for every scene.

Your task:
* For each scene (including introduction, all main scenes, and finale), write a detailed, engaging, and age-appropriate narration for the voiceover.
* Expand and enrich the original narration from the script, using the visual details and actions described in the enhanced media prompts.
* Make sure each narration is long enough to match the scene's duration (6 or 10 seconds). Narration should be 2–3 sentences for 6s scenes, 3–5 sentences for 10s scenes.
* Use simple, cheerful, and interactive language suitable for preschoolers. Include questions, exclamations, and direct address to the viewer where appropriate.
* Ensure the narration matches the visual actions, emotions, and transitions described in the enhanced media prompts.
* Do NOT include any JSON formatting, code blocks, or markdown in your output—just return a JSON array as described below.

Input:
Script:
{script}

Enhanced media prompts:
{enhancedMedia}

Output format:
Return a JSON array, one object per scene, with these fields:
- scene: (number or "final")
- scene_type: ("introduction", "main", or "finale")
- narration: (detailed narration text for this scene)

Example output:
[
  {{ "scene": 0, "scene_type": "introduction", "narration": "Hi, I'm Sunny the Bunny! Look at this beautiful meadow—there are so many colors to explore. Are you ready to go on an adventure with me?" }},
  {{ "scene": 1, "scene_type": "main", "narration": "Wow, a red butterfly is flying all around me! Its wings are so bright and pretty. Can you spot something red where you are?" }},
  {{ "scene": 2, "scene_type": "main", "narration": "Now, look—a green frog is jumping near the stream! He looks so happy to see us. Let's say hello to our new friend!" }},
  {{ "scene": "final", "scene_type": "finale", "narration": "What a fun day we've had! Which color did you like the most? I can't wait to play and learn with you again soon!" }}
]
`;

const narrationPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["script", "enhancedMedia"],
    template: narrationPromptTemplate
});

export {
    narrationPrompt,
}; 