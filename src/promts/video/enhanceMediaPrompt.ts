/**
 * Enhance Media Prompt
 * Improves media prompts for consistency across scenes
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { shortenVideoPrompt } from './shortenVideoPrompt.js';

const enhanceMediaPromptTemplate: string = `
You are improving prompts for image and video generation for a children's educational video.

Here are the current prompts for each scene (in JSON array format):
{media_prompts}

Here is the detailed main character description:
{character}

Here is the script of the video:
{script}

Your task:
For Scene 0, enhance both the image and video prompts with more specific details about the main character. For all subsequent scenes, enhance only the video prompts. Make sure the character's appearance, style, and unique features are always the same and clearly match the character description across all scenes, emphasizing their key traits and accessories.

* IMPORTANT - SCENE DURATION:
 - Each scene has a specific duration value (either 6 or 10 seconds)
 - DO NOT modify the duration values provided in the input
 - Preserve the exact duration value for each scene in your output
 - The duration is provided as a separate field in the JSON, not in the prompt text

IMPORTANT:
* DO NOT include any dialogue or specific phrases that characters say in your prompts. Also, DO NOT add any words, letters, numbers or symbols to display in prompt! This breaks video generation and causes text to appear in the video.
* Instead, enhance descriptions of facial expressions, body language, and emotions to convey meaning.
* Focus on visual elements, actions, and reactions rather than speech.
* Add detailed facial expressions (e.g., "with a surprised expression," "looking curious with wide eyes," "smiling excitedly") to help convey the character's emotions.
* Ensure consistent appearance details across all scenes (same clothing, accessories, color palette, etc.).
* If any existing prompts contain dialogue, remove it and replace with appropriate visual descriptions.
* Ensure the main character takes up NO MORE THAN 40% of the total image space in all prompts. Check and adjust any prompts where the character might dominate the frame.
* Enhance environmental descriptions in all prompts:
 - Add rich details about the setting (location, weather, time of day, lighting)
 - Include relevant props and environmental objects that support the educational theme
 - Describe landscape features, colors, and textures that create an immersive scene
 - Maintain environmental consistency across scenes (same location features should remain consistent)
 - Add environmental elements that help establish scale and proper composition
 - Ensure the environment complements the educational content of each scene

* CRITICAL: MAINTAIN SCENE-TO-SCENE CONTINUITY:
 - Review all scenes as a sequence and ensure they flow logically from one to the next
 - For each scene, check what objects, props, and environmental elements were present in the previous scene
 - When a new object appears that wasn't in previous scenes, add an explicit description of how it appears with a visible action (e.g., "Character reaches into their backpack and pulls out a book")
 - If an object is present in one scene but not in the next, add an explanation of what happened to it (e.g., "Character puts the book back into their backpack")
 - Add transitional elements between scenes (e.g., "As the butterfly flies away, Character walks toward the pond")
 - Ensure the environment evolves naturally between scenes rather than changing abruptly
 - Check for and fix any continuity errors where objects appear or disappear without explanation
 - Pay special attention to props, accessories, and background elements that might suddenly appear or disappear
 - Remember that the last frame of each video will be used as the reference for the starting point of the next video

* CRITICAL - VIDEO GENERATION CONTEXT LIMITATIONS:
 - The video generation system will NOT have access to previous prompts or scene descriptions
 - It will ONLY have the last frame from the previous video as a reference point
 - Any visual element that should persist between scenes must be explicitly described again in each new scene

* MAINTAIN TOPIC CONSISTENCY:
 - Ensure the main educational topic from the script is visually represented in EVERY scene
 - Include visual elements, props, or environmental details that clearly relate to the topic
 - Make the topic visually recognizable even without narration

Return the improved prompts as a JSON array without any markdown formatting or code blocks. The JSON structure should include image_prompt only for Scene 0, video_prompt for all scenes, and duration for all scenes:
[
 {{ "scene": 0, "scene_type": "introduction", "image_prompt": "...", "video_prompt": "...", "duration": 6 }},
 {{ "scene": 1, "scene_type": "main", "video_prompt": "...", "duration": 10 }},
 {{ "scene": 2, "scene_type": "main", "video_prompt": "...", "duration": 6 }},
 ...
 {{ "scene": "final", "scene_type": "finale", "video_prompt": "...", "duration": 10 }}
]

IMPORTANT: The duration field must be preserved exactly as it was in the input. Only the values 6 and 10 are allowed, with no additional symbols or text.
CRITICAL: Each video_prompt and image_prompt in the output must be no more than 1500 characters in length.
`;

const enhanceMediaPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["media_prompts", "character", "script"],
    template: enhanceMediaPromptTemplate
});

export {
    enhanceMediaPrompt,
    shortenVideoPrompt,
};
/* END GENAI */