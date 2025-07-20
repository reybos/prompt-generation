/**
 * Media Prompt
 * Generates prompts for image and video generation for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';

const mediaPromptTemplate: string = `
You are an assistant for creating educational videos for kids aged 2–6.
You are provided with:
* The script of the video, which includes:
 - A "scenes" array (the first element is the introduction, the last is the finale, and the rest are main scenes; each has a title, description, and narration)
 - A "topic" field that defines the main educational subject of the video
* A detailed description of the main character (character sheet)

Your task:
* PAY SPECIAL ATTENTION to the "topic" field in the script. This is the main educational subject that should be clearly represented visually throughout the entire video.
* Ensure that every scene's prompt explicitly incorporates visual elements related to this topic.
* Create media prompts for ALL scenes in the array:
 - The first scene (index 0) is the introduction
 - The last scene is the finale
 - The rest are main scenes
* For Scene 0 (introduction) ONLY:
 - Create a clear, concise prompt for generating an image in Midjourney/DALL-E (in English, always using the main character description, describing the main action, mood, color palette, cartoon style, 2D).
 - Create a prompt for generating a short animation/video (in English, using the main character description, describing the main action, characters, background, cartoonish and vibrant style, 2D, child-friendly).

* CRITICAL SIMPLICITY & STYLE REQUIREMENTS FOR ALL PROMPTS:
 - Limit each scene to 1–3 main focus objects (e.g., sun, bus, banana) that are the clear center of attention
 - Use a relatable, simple setting (e.g., a road, a park, a garden, a room) that a child can imagine
 - Add only subtle, minimal background details (e.g., a few clouds, a hill, a couple of flowers) to create atmosphere, but do not let them compete with the main objects
 - Only the main object(s) should have prominent movement; background elements should move gently or remain mostly still
 - Avoid fantasy 'object parades' or scenes crowded with too many characters or items
 - The composition must be minimalist and uncluttered, with few objects and lots of negative (empty) space
 - Avoid busy or crowded scenes; keep details to a minimum and use simple shapes
 - All visuals must be in a flat, 2D cartoon style (no 3D, no realistic shading, no volumetric lighting)
 - Use simple shapes, bold outlines, and bright, solid colors
 - Avoid photorealism, gradients, or complex textures
 - All elements should look like classic flat cartoons or children’s book illustrations
 - Environments and characters should be playful, stylized, and easy for children to understand
 - The main character or main object should be the clear center of attention, with plenty of open space around, and the composition should remain uncluttered and easy for children to understand

* IMPORTANT - SCENE DURATION:
 - Each scene must have a specific duration value
 - Only two duration values are allowed: 6 seconds or 10 seconds
 - Assign an appropriate duration to each scene based on its complexity and content
 - The duration will be included as a separate field in the JSON output, not in the prompt text
* For all subsequent scenes (Scene 1, 2, 3, etc.) and the finale:
 - Create ONLY video prompts that continue directly from the last frame of the previous scene's video
 - Ensure visual continuity between scenes by keeping the character's position, environment, and main visual elements consistent, but do not over-describe transitions or every small action.
 - Discourage accumulation of objects and environmental evolution unless essential to the story or educational topic. Do not add new props or background elements unless required.
 - Keep transitions gentle and simple; avoid complex or abrupt changes.

IMPORTANT: 
* DO NOT include any dialogue or specific phrases that characters say in your prompts. Also, DO NOT add any words, letters, numbers or symbols to display in prompt! This breaks video generation and causes text to appear in the video.
* Instead, describe facial expressions, body language, and emotions to convey meaning.
* Focus on the main visual elements, actions, and reactions rather than speech or step-by-step transitions.
* Include facial expressions (e.g., "with a surprised expression," "looking curious with wide eyes," "smiling excitedly") to help convey the character's emotions.
* Include only a few, simple background or foreground elements to keep the scene uncluttered and easy to understand.

* MAINTAIN SCENE-TO-SCENE CONTINUITY:
 - Ensure consistent environment and setting across all scenes, but do not accumulate objects or details unless essential
 - If a new object is important to the scene, mention its presence and how it fits into the scene, but avoid describing every step of how the character interacts with objects unless it is essential to the story or educational topic.
 - Consider the sequence of scenes as a continuous story where each scene logically follows from the previous one, but keep transitions simple and natural.
 - Avoid "magical" appearances or disappearances of objects between scenes, but do not over-explain object handling.
 - The last frame of each video will be used as the reference for the starting point of the next video

* CRITICAL - VIDEO GENERATION CONTEXT LIMITATIONS:
 - The video generation system will NOT have access to previous prompts or scene descriptions
 - It will ONLY have the last frame from the previous video as a reference point

* MAINTAIN TOPIC CONSISTENCY:
 - Ensure the main educational topic from the script is visually represented in EVERY scene
 - Include visual elements, props, or environmental details that clearly relate to the topic
 - Make the topic visually recognizable even without narration

Format the result as a list:
Scene 0 (Introduction):
— Prompt for image: ...
— Prompt for video: ...
Scene 1:
— Prompt for video: ... (starting from the last frame of Scene 0's video)
Scene 2:
— Prompt for video: ... (starting from the last frame of Scene 1's video)
…
Final Scene (Finale):
— Prompt for video: ... (starting from the last frame of the previous scene's video)

Use simple storylines and wording that are easy for children to understand. In each prompt, be sure to refer to the detailed character description.

Example:
Here is the script:
{{
 "topic": "Learning Colors",
 "scenes": [
   {{
     "title": "Sunny the Bunny Greets",
     "description": "A small, fluffy bunny appears in a colorful meadow and waves hello",
     "narration": "Hi! I'm Sunny! Today we're learning colors!"
   }},
   {{
     "title": "Red Butterfly",
     "description": "A red butterfly flies around Sunny",
     "narration": "Here's a red butterfly!"
   }},
   {{
     "title": "Green Frog",
     "description": "A green frog jumps near Sunny",
     "narration": "Here's a green frog!"
   }},
   {{
     "title": "Yellow Duckling",
     "description": "A yellow duckling waddles up to Sunny",
     "narration": "And this is a yellow duckling!"
   }},
   {{
     "title": "Question for Kids",
     "description": "Sunny smiles and points toward the viewer",
     "narration": "Which color did you like the most?"
   }}
 ]
}}

Here is the detailed character description:
Main character: Sunny the Bunny
Sunny is a small, fluffy cartoon bunny with soft white fur, big blue eyes, and a tiny pink nose. She always wears a bright orange bow on her right ear and has a cheerful, friendly smile. Sunny loves to hop and wave at her friends. Her favorite accessory is a sky-blue backpack. She is curious, outgoing, and loves helping others. When she's happy, her ears wiggle and she giggles softly. Sunny lives in a cozy burrow in Flower Meadow and enjoys exploring new colors and playing with her animal friends.
ChatGPT will generate:
Scene 0 (Introduction):
— Prompt for image: "Sunny the Bunny, a small, fluffy white cartoon bunny with a bright orange bow on her right ear and a sky-blue backpack, is waving and smiling on a colorful meadow. The bunny is positioned in the lower left corner, with the rest of the scene showing a wide, open meadow with a single large flower and a puffy cloud in the sky. The composition is minimalist, uncluttered, and full of open space. Flat 2D cartoon style, bold outlines, solid colors, 2D."
— Prompt for video: "Sunny the Bunny, the small fluffy white bunny with a bright orange bow and blue backpack, hops into the lower left corner of a wide, open meadow. She waves hello, smiling joyfully with an enthusiastic expression. The rest of the frame is mostly open space, with a single large flower and one puffy cloud in the background. The composition is uncluttered and simple, with minimal details and lots of empty space. Flat 2D cartoon style, bold outlines, solid colors, 2D."

Scene 1:
— Prompt for video: "Starting from the last frame of Scene 0 where Sunny the Bunny is in the lower left corner of the open meadow. A red cartoon butterfly flutters into view, staying small in the scene. Sunny looks up with excitement, her ears perking up. The background remains uncluttered, with only the single flower and cloud. The scene is simple, with minimal details and lots of open space. Flat 2D cartoon style, bold outlines, solid colors, 2D."

Scene 2:
— Prompt for video: "Starting from the last frame of Scene 1 where Sunny the Bunny is watching the red butterfly. A green frog hops into the scene, staying small in the scene. Sunny and the frog are both in the lower part of the frame, with the rest of the scene open and uncluttered. Only the single flower and cloud remain in the background. The composition is minimalist, with simple shapes and lots of empty space. Flat 2D cartoon style, bold outlines, solid colors, 2D."

Scene 3:
— Prompt for video: "Starting from the last frame of Scene 2 where Sunny the Bunny and the green frog are together. The frog hops away, and Sunny waves goodbye. The background remains the same: a wide, open meadow with a single flower and a puffy cloud. The scene is uncluttered, with minimal details and lots of open space. Flat 2D cartoon style, bold outlines, solid colors, 2D."

Final Scene (Finale):
— Prompt for video: "Starting from the last frame of Scene 3 where Sunny the Bunny is waving goodbye. The sun sets in the background, casting a warm glow over the open meadow. Sunny is still small in the lower left corner, with the rest of the scene open and uncluttered. Only the single flower and cloud remain. The composition is minimalist, with simple shapes and lots of empty space. Flat 2D cartoon style, bold outlines, solid colors, 2D."
...

Here is the script:
{script}

Here is the detailed character description:

{character}

Return the result as a JSON array without any markdown formatting or code blocks:
[
{{ "scene": 0, "scene_type": "introduction", "image_prompt": "...", "video_prompt": "...", "duration": 6 }},
{{ "scene": 1, "scene_type": "main", "video_prompt": "...", "duration": 10 }},
{{ "scene": 2, "scene_type": "main", "video_prompt": "...", "duration": 6 }},
...
{{ "scene": "final", "scene_type": "finale", "video_prompt": "...", "duration": 10 }}
]

Important: Make sure to include media prompts for ALL scenes in the array (introduction, main scenes, and finale).

CRITICAL: Each video_prompt and image_prompt in the output must be no more than 1500 characters in length.
`;

const mediaPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["script", "character"],
    template: mediaPromptTemplate
});

export {mediaPrompt,};


