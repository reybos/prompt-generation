/**
 * Media Prompt
 * Generates prompts for image and video generation for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';

const mediaPromptTemplate: string = `
You are an assistant for creating educational videos for kids aged 2–6.
You are provided with:
* The script of the video, which includes:
 - An introduction section (greeting)
 - Multiple scenes (with title, description, and narration for each)
 - A finale section (question or call to action)
 - A "topic" field that defines the main educational subject of the video
* A detailed description of the main character (character sheet)

Your task:
* PAY SPECIAL ATTENTION to the "topic" field in the script. This is the main educational subject that should be clearly represented visually throughout the entire video.
* Ensure that every scene's prompt explicitly incorporates visual elements related to this topic.
* Create media prompts for ALL parts of the video:
 - The introduction (as Scene 0)
 - Each scene in the scenes array (as Scene 1, 2, 3, etc.)
 - The finale (as the final scene)
* For Scene 0 (introduction) ONLY:
 - Create a clear, concise prompt for generating an image in Midjourney/DALL-E (in English, always using the main character description, describing the action, mood, color palette, cartoon style, vertical format).
 - Create a prompt for generating a short animation/video (in English, using the main character description, describing the action, characters, background, cartoonish and vibrant style, vertical format, child-friendly).
* IMPORTANT - SCENE DURATION:
 - Each scene must have a specific duration value
 - Only two duration values are allowed: 6 seconds or 10 seconds
 - Assign an appropriate duration to each scene based on its complexity and content
 - The duration will be included as a separate field in the JSON output, not in the prompt text
* For all subsequent scenes (Scene 1, 2, 3, etc.) and the finale:
 - Create ONLY video prompts that continue directly from the last frame of the previous scene's video
 - Ensure perfect visual continuity between scenes by matching the character's position, environment, and all visual elements

IMPORTANT: 
* DO NOT include any dialogue or specific phrases that characters say in your prompts. Also, DO NOT add any words, letters, numbers or symbols to display in prompt! This breaks video generation and causes text to appear in the video.
* Instead, describe facial expressions, body language, and emotions to convey meaning.
* Focus on visual elements, actions, and reactions rather than speech.
* Include detailed facial expressions (e.g., "with a surprised expression," "looking curious with wide eyes," "smiling excitedly") to help convey the character's emotions.
* Ensure the main character takes up NO MORE THAN 40% of the total image space. This allows for proper scene composition and prevents the character from dominating the frame.
* Include rich, detailed descriptions of the environment and background in each prompt:
 - Describe the setting in detail (location, weather, time of day, lighting)
 - Include relevant props and environmental objects that support the educational theme
 - Mention landscape features, colors, and textures that create an immersive scene
 - Establish proper scale relationships between the character and environment elements

* MAINTAIN SCENE-TO-SCENE CONTINUITY:
 - Ensure consistent environment and setting across all scenes
 - When a new object appears that wasn't in previous scenes, EXPLICITLY describe how it appears with a visible action (e.g., "Character reaches into their backpack and pulls out a book" rather than having the book just appear)
 - Track all objects, props, and environmental elements across scenes to maintain consistency
 - If an object is present in one scene but not in the next, explain what happened to it (e.g., "Character puts the book back into their backpack")
 - Consider the sequence of scenes as a continuous story where each scene logically follows from the previous one
 - Avoid "magical" appearances or disappearances of objects between scenes
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
 "introduction": "Hi! I'm Bunny. Today we're learning colors.",
 "scenes": [
 {{
 "title": "Red Butterfly",
 "description": "A red butterfly flies around Bunny",
 "narration": "Here's a red butterfly!"
 }},
 {{
 "title": "Green Frog",
 "description": "A green frog jumps near Bunny",
 "narration": "Here's a green frog!"
 }},
 {{
 "title": "Yellow Duckling",
 "description": "A yellow duckling waddles up to Bunny",
 "narration": "And this is a yellow duckling!"
 }}
 ],
 "finale": "Which color did you like the most?"
}}

Here is the detailed character description:
Main character: Bunny
Name: Sunny the Bunny
Sunny is a small, fluffy cartoon bunny with soft white fur, big blue eyes, and a tiny pink nose. She always wears a bright orange bow on her right ear and has a cheerful, friendly smile. Sunny loves to hop and wave at her friends. Her favorite accessory is a sky-blue backpack. She is curious, outgoing, and loves helping others. When she's happy, her ears wiggle and she giggles softly. Sunny lives in a cozy burrow in Flower Meadow and enjoys exploring new colors and playing with her animal friends.
ChatGPT will generate:
Scene 0 (Introduction):
— Prompt for image: "Sunny the Bunny, a small, fluffy white cartoon bunny with a bright orange bow on her right ear and a sky-blue backpack, is waving and smiling on a colorful meadow. The bunny takes up only 40% of the image, allowing the vibrant meadow environment to be visible with wildflowers, butterflies, and a clear blue sky with fluffy clouds. The atmosphere is bright and cheerful, vertical format, cartoon style, child-friendly."
— Prompt for video: "Sunny the Bunny, the small fluffy white bunny with a bright orange bow and blue backpack, hops onto a colorful meadow and waves hello, smiling joyfully with an enthusiastic expression. Her ears wiggle with excitement as she gestures toward colorful objects around her. Sunny takes up only 40% of the frame, with the rest showing a vibrant meadow with swaying flowers, butterflies fluttering about, and a clear blue sky with puffy clouds. The background is detailed yet child-friendly, vertical video, cartoon animation."

Scene 1:
— Prompt for video: "Starting from the last frame of Scene 0 where Sunny the Bunny is standing in the colorful meadow with her ears wiggling with excitement. As she continues exploring the same meadow, a red cartoon butterfly suddenly flutters into view from a nearby flower and flies around her. Sunny, smiling and excited, follows the butterfly with her eyes, her ears perking up with interest. Sunny occupies only 30% of the frame, allowing the butterfly to be prominently featured. The environment shows the same detailed meadow with various wildflowers, tall grass swaying in the breeze, and sunlight filtering through trees creating dappled light patterns on the ground. Bright and vibrant, child-friendly, vertical video, cartoon animation."

Scene 2:
— Prompt for video: "Starting from the last frame of Scene 1 where Sunny the Bunny is watching the red butterfly with excitement. As the butterfly flies away toward the water, Sunny follows it and approaches a small stream that runs through the same meadow. She kneels down by the water's edge, where a green frog suddenly jumps out from behind a lily pad. Sunny points at the frog with excitement, her eyes wide with wonder. Sunny takes up about 35% of the frame, with the frog and environment taking up the rest. The setting includes the same small stream with lily pads, cattails along the bank, dragonflies hovering above the water, and colorful wildflowers dotting the lush green grass. Bright and vibrant colors, child-friendly, vertical video, cartoon animation."

Scene 3:
— Prompt for video: "Starting from the last frame of Scene 2 where Sunny the Bunny is pointing at the green frog by the stream. As the frog hops away into the reeds, Sunny follows the stream which opens up into a wider pond area. She sits on a smooth stone by the water's edge, still in the same meadow environment. From the water, a yellow duckling notices Sunny and waddles up to her across the shore. Sunny kneels down and gently pets the duckling with a gentle, nurturing expression. Together they occupy about 40% of the frame. The environment shows the same detailed pond area with water lilies, smooth stones along the shore, reeds swaying gently in the breeze, and a family of ducks swimming in the background. Sunlight sparkles on the water surface creating a peaceful atmosphere. Bright and vibrant colors, child-friendly, vertical video, cartoon animation."

Final Scene (Finale):
— Prompt for video: "Starting from the last frame of Scene 3 where Sunny the Bunny is kneeling down petting the yellow duckling. As the duckling returns to its family in the pond, Sunny waves goodbye and walks to a small hill in the same meadow. The sun is now setting, casting a golden glow across the landscape. Sunny turns to face the viewer with a curious, questioning expression. She tilts her head to one side with raised eyebrows and a gentle smile, gesturing with her paw toward different colored objects. Sunny takes up about 35% of the frame, positioned slightly off-center. Small icons of red, green, and yellow objects appear around her, representing the butterfly, frog, and duckling from the previous scenes. Her ears perk up attentively. The background shows the same meadow now at sunset with a gradient sky of warm colors, silhouettes of trees in the distance, and gentle rolling hills. Golden light bathes the scene creating a warm, inviting atmosphere. Bright and vibrant colors, child-friendly, vertical video, cartoon animation."
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

Important: Make sure to include media prompts for ALL parts of the video:
1. The introduction (scene 0)
2. All scenes from the scenes array (scenes 1, 2, 3, etc.)
3. The finale (final scene)

CRITICAL: Each video_prompt and image_prompt in the output must be no more than 1500 characters in length.
`;

const mediaPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["script", "character"],
    template: mediaPromptTemplate
});

export {mediaPrompt,};


