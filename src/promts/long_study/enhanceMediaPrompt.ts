/**
 * Enhance Media Prompt
 * Improves media prompts for consistency across scenes
 */

import { PromptTemplate } from '@langchain/core/prompts';

// --- Duration Requirements ---
const DURATION_REQUIREMENTS = `
* IMPORTANT - SCENE DURATION:
 - Each scene has a specific duration value (10 seconds)
 - DO NOT modify the duration values provided in the input
 - Preserve the exact duration value for each scene in your output
 - The duration is provided as a separate field in the JSON, not in the prompt text
`;

// --- Restrictions ---
const RESTRICTIONS = `
IMPORTANT:
* DO NOT include any dialogue or specific phrases that characters say in your prompts. Also, DO NOT add any words, letters, numbers or symbols to display in prompt! This breaks video generation and causes text to appear in the video.
* Instead, enhance descriptions of facial expressions, body language, and emotions to convey meaning.
* Focus on visual elements, actions, and reactions rather than speech.
* Add detailed facial expressions (e.g., "with a surprised expression," "looking curious with wide eyes," "smiling excitedly") to help convey the character's emotions.
* Ensure consistent appearance details across all scenes (same clothing, accessories, color palette, etc.).
* If any existing prompts contain dialogue, remove it and replace with appropriate visual descriptions.
* Ensure the main character takes up NO MORE THAN 40% of the total image space in all prompts. Check and adjust any prompts where the character might dominate the frame.
`;

// --- Environmental Requirements ---
const ENVIRONMENT_REQUIREMENTS = `
* Enhance environmental descriptions in all prompts:
 - Add rich details about the setting (location, weather, time of day, lighting)
 - Include relevant props and environmental objects that support the educational theme
 - Describe landscape features, colors, and textures that create an immersive scene
 - Maintain environmental consistency across scenes (same location features should remain consistent)
 - Add environmental elements that help establish scale and proper composition
 - Ensure the environment complements the educational content of each scene
`;

// --- Continuity Requirements ---
const CONTINUITY_REQUIREMENTS = `
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
`;

// --- Video Generation Context Limitations ---
const VIDEO_GEN_LIMITS = `
* CRITICAL - VIDEO GENERATION CONTEXT LIMITATIONS:
 - The video generation system will NOT have access to previous prompts or scene descriptions
 - It will ONLY have the last frame from the previous video as a reference point
 - Any visual element that should persist between scenes must be explicitly described again in each new scene
`;

// --- Topic Consistency ---
const TOPIC_REQUIREMENTS = `
* MAINTAIN TOPIC CONSISTENCY:
 - Ensure the main educational topic from the script is visually represented in EVERY scene
 - Include visual elements, props, or environmental details that clearly relate to the topic
 - Make the topic visually recognizable even without narration
`;

// --- Output Format ---
const OUTPUT_FORMAT = `
Return the improved prompts as a JSON array without any markdown formatting or code blocks. The JSON structure should include image_prompt only for Scene 0, video_prompt for all scenes, and duration for all scenes:

CRITICAL: You MUST output exactly the same number of scenes as in the input media_prompts. Do NOT add or remove any scenes.

[
 {{ "scene": 0, "scene_type": "introduction", "image_prompt": "...", "video_prompt": "...", "duration": 10 }},
 {{ "scene": 1, "scene_type": "main", "video_prompt": "...", "duration": 10 }},
 {{ "scene": 2, "scene_type": "main", "video_prompt": "...", "duration": 10 }},
 ...
 {{ "scene": N, "scene_type": "finale", "video_prompt": "...", "duration": 10 }}
]

IMPORTANT: The duration field must be preserved exactly as it was in the input. Only the value 10 is allowed, with no additional symbols or text.
CRITICAL: Each video_prompt and image_prompt in the output must be no more than 1500 characters in length.
CRITICAL: Count the input scenes and output exactly that many scenes. If input has 10 scenes, output exactly 10 scenes.
`;

// --- General Instructions ---
const GENERAL_INSTRUCTIONS = `
You are improving prompts for image and video generation for a children's educational video.

Here are the current prompts for each scene (in JSON array format):
{media_prompts}

Here is the script of the video:
{script}

Your task:
For Scene 0, enhance both the image and video prompts with more specific details about the main character. For all subsequent scenes, enhance only the video prompts. Make sure the character's appearance, style, and unique features are always the same and clearly match the character description across all scenes, emphasizing their key traits and accessories.

**VISUAL ENHANCEMENT**: While maintaining character consistency within this video, consider adding distinctive visual elements for variety:

1. **Character Accessories** - Consider adding:
   - Hats, scarves, glasses, jewelry, backpacks, tools, magical items, seasonal accessories
   - Or create your own unique accessories that fit the character

2. **Environmental Details** - Consider adding:
   - Weather effects, seasonal elements, time of day indicators, atmospheric particles, background characters, architectural details
   - Or develop your own environmental elements that enhance the scene

3. **Visual Effects** - Consider adding:
   - Sparkles, glowing effects, motion lines, shadow details, texture variations, color gradients
   - Or create your own visual effects that add interest and depth

Use these as inspiration to make this video visually distinctive and engaging.
`;

const enhanceMediaPromptTemplate = `
${GENERAL_INSTRUCTIONS}
${DURATION_REQUIREMENTS}
${RESTRICTIONS}
${ENVIRONMENT_REQUIREMENTS}
${CONTINUITY_REQUIREMENTS}
${VIDEO_GEN_LIMITS}
${TOPIC_REQUIREMENTS}

${OUTPUT_FORMAT}
`;

const enhanceMediaPrompt = new PromptTemplate({
    inputVariables: ["media_prompts", "script"],
    template: enhanceMediaPromptTemplate
});

// --- Shorten Video Prompt (оставляем без изменений) ---
const shortenVideoPromptTemplate = `
You are an expert at editing and condensing prompts for video generation for children's educational videos.

You will be given a video prompt that is too long (over 2000 characters). Your task is to shorten this video prompt to be under 1700 characters, while preserving as much of the original meaning, visual detail, and intent as possible. Do not remove important visual elements, but prioritize brevity and clarity. If needed, rephrase, combine sentences, and remove redundant or overly detailed descriptions, but keep the core idea and all critical visual information.

Do NOT add any new information. Do NOT change the meaning or intent of the prompt. Only shorten and clarify.

Return ONLY the shortened video prompt as plain text, with no markdown, code blocks, or extra formatting.

CRITICAL: Each video_prompt and image_prompt in the output must be no more than 1500 characters in length.

Here is the original video prompt:
{video_prompt}
`;
const shortenVideoPrompt = new PromptTemplate({
    inputVariables: ["video_prompt"],
    template: shortenVideoPromptTemplate
});

export { enhanceMediaPrompt, shortenVideoPrompt, };