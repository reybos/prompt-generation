/**
 * Media Prompt
 * Generates prompts for image and video generation for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';

// --- Style and Simplicity Requirements ---
const STYLE_REQUIREMENTS = `
CRITICAL SIMPLICITY & STYLE REQUIREMENTS FOR ALL PROMPTS:
- Use a relatable, simple setting (e.g., a road, a park, a garden, a room) that a child can imagine
- Only the main object(s) should have prominent movement; background elements should move gently or remain mostly still
- Avoid scenes crowded with too many characters or items
- The composition must be minimalist and uncluttered
- All visuals must be in 2D or 3D cartoon, no realistic 
- Use simple shapes, bold outlines, and bright, solid colors
- Avoid photorealism, gradients, or complex textures
- All elements should look like classic flat cartoons or children's book illustrations
- Environments and characters should be playful, stylized, and easy for children to understand
`;

const DURATION_REQUIREMENTS = `
IMPORTANT - SCENE DURATION:
- Each scene must have a specific duration value
- All scenes must be exactly 10 seconds long
- The duration will be included as a separate field in the JSON output, not in the prompt text
`;

const VIDEO_GENERATION_ELEMENTS = `
VIDEO GENERATION ELEMENTS TO INCLUDE FOR EACH 10-SECOND SCENE:
- **Scene breakdown**: Break each 10-second video into timed sub-scenes (e.g., Sub-scene 1 (0-3s), Sub-scene 2 (3-7s), Sub-scene 3: (7-10s)) based on the narration content and educational progression
- **Characters**: Describe main characters, their appearance, expressions, and actions throughout the scene
- **Backgrounds**: Describe settings, colors, and visual environment that support the educational topic
- **Movements**: Include camera movements, character actions, and dynamic elements that enhance learning
- **Objects and props**: Describe interactive elements, props, and visual objects related to the educational topic
- **Style description**: Overall visual style (cartoonish, flat 2D, colors, textures) consistent with children's educational content
- **Interactive elements**: Engaging animations, visual effects, and elements that capture children's attention
- **Transitions**: How sub-scenes flow from one to another within the 10-second duration
- **Educational focus**: Ensure each sub-scene reinforces the main educational topic through visual elements
`;

const CONTINUITY_REQUIREMENTS = `
MAINTAIN SCENE-TO-SCENE CONTINUITY:
- Ensure consistent environment and setting across all scenes, but do not accumulate objects or details unless essential
- If a new object is important to the scene, mention its presence and how it fits into the scene, but avoid describing every step of how objects interact unless it is essential to the story or educational topic.
- Consider the sequence of scenes as a continuous story where each scene logically follows from the previous one, but keep transitions simple and natural.
- Avoid "magical" appearances or disappearances of objects between scenes, but do not over-explain object handling.
`;

const VIDEO_GEN_LIMITS = `
CRITICAL - VIDEO GENERATION CONTEXT LIMITATIONS:
- The video generation system will NOT have access to previous prompts or scene descriptions
- It will ONLY have the last image frame from the previous video as a reference point
`;

const TOPIC_REQUIREMENTS = `
MAINTAIN TOPIC CONSISTENCY:
- Ensure the main educational topic from the script is visually represented in EVERY scene
- Include visual elements, props, or environmental details that clearly relate to the topic
- Make the topic visually recognizable even without narration
`;

const OUTPUT_FORMAT = `
Return the result as a JSON array without any markdown formatting or code blocks:
[
{{ "scene": 0, "scene_type": "introduction", "image_prompt": "...", "video_prompt": "...", "duration": 10 }},
{{ "scene": 1, "scene_type": "main", "video_prompt": "...", "duration": 10 }},
{{ "scene": 2, "scene_type": "main", "video_prompt": "...", "duration": 10 }},
...
{{ "scene": "final", "scene_type": "finale", "video_prompt": "...", "duration": 10 }}
]

Requirements:
- The response must be **raw JSON only**, no Markdown, no backticks, no text before or after.
- The output must be valid \`application/json\`.
- All double quotes inside string values must be escaped as \`\\"\`.
- Ensure there are no trailing commas or syntax errors.
- The JSON must be ready for direct parsing by \`JSON.parse()\` with no preprocessing.

Important: Make sure to include media prompts for ALL scenes in the array (introduction, main scenes, and finale).

CRITICAL: Each video_prompt and image_prompt in the output must be no more than 1500 characters in length.
`;

const GENERAL_INSTRUCTIONS = `
You are an assistant for creating educational videos for kids aged 2–6.
You are provided with:
* The script of the video, which includes:
 - A "scenes" array (the first element is the introduction, the last is the finale, and the rest are main scenes; each has a title, description, and narration)
 - A "topic" field that defines the main educational subject of the video (for example: "Learning Colors", "Learning Shapes", "Learning Numbers", "Animals", "Learning Letters", "Learning Emotions", "Learning Body Parts", "Learning Weather", "Learning Food", "Learning Transportation", etc.)

Your task:
* Ensure that every scene's prompt explicitly incorporates visual elements related to this topic.
* **VISUAL DIVERSITY REQUIREMENT**: Create unique visual styles and character designs for each video:
  - Vary character appearances: different species, ages, clothing, accessories, colors
  - Use diverse settings: forests, cities, space, underwater, gardens, mountains, beaches, farms
  - Include varied visual elements: different props, backgrounds, lighting, weather conditions
* Create media prompts for ALL scenes in the array:
 - The first scene (index 0) is the introduction
 - The last scene is the finale
 - The rest are main scenes
* For Scene 0 (introduction) ONLY:
 - Create a clear, concise prompt for generating an image in Midjourney/DALL-E (in English, describing the main action, mood, color palette, cartoon style, 2D). The image_prompt should emphasize highly stylized, cartoon-like characters with exaggerated features, flat colors, and simple geometric shapes.
 - Create a prompt for generating a short animation/video (in English, describing the main action, characters, background, cartoonish and vibrant style, 2D, child-friendly).
* For all subsequent scenes (Scene 1, 2, 3, etc.) and the finale:
 - Create ONLY video prompts
 - Break down each 10-second scene into timed sub-scenes (e.g., 0-3s, 3-7s, 7-10s) based on the narration content
 - Ensure visual continuity between scenes by keeping the position of main objects, environment, and main visual elements consistent, but do not over-describe transitions or every small action.
 - Keep transitions gentle and simple; avoid complex or abrupt changes.
 - Each sub-scene should have specific visual elements that support the educational progression within that time segment.
`;

const RESTRICTIONS = `
CRITICAL RESTRICTIONS:
* DO NOT include any dialogue, words, letters, numbers, or symbols in prompts - this breaks video generation
* Use facial expressions, body language, and emotions to convey meaning instead of text
* Focus on visual elements, actions, and reactions rather than speech or complex transitions
* Include facial expressions (surprised, curious, excited) to convey emotions
* Keep scenes uncluttered with minimal background/foreground elements
* Use simple storylines and wording appropriate for children aged 2-6
`;

const mediaPromptTemplate: string = `
${GENERAL_INSTRUCTIONS}
${STYLE_REQUIREMENTS}
${DURATION_REQUIREMENTS}
${VIDEO_GENERATION_ELEMENTS}
${RESTRICTIONS}
${CONTINUITY_REQUIREMENTS}
${VIDEO_GEN_LIMITS}
${TOPIC_REQUIREMENTS}

**VISUAL CREATIVITY INSTRUCTION**: To ensure visual variety, consider these visual options as inspiration (you can choose from these or create your own unique combinations):

1. **Color Palette Inspiration** - Consider these color approaches:
   - Warm colors: reds, oranges, yellows, pinks for energetic, cheerful scenes
   - Cool colors: blues, greens, purples, teals for calm, peaceful scenes
   - Earth tones: browns, tans, greens, golds for natural, organic scenes
   - Pastel colors: light pinks, blues, yellows, lavenders for gentle, soft scenes
   - Bright neon: electric blues, hot pinks, lime greens for vibrant, exciting scenes
   - Monochrome: various shades of one color for focused, artistic scenes
   - Or create your own unique color combination

2. **Visual Style Inspiration** - Consider these artistic approaches:
   - Flat 2D cartoon style with bold outlines for clear, simple visuals
   - Soft watercolor-like cartoon style for gentle, dreamy scenes
   - Geometric shapes and clean lines for modern, structured visuals
   - Rounded, bubbly character designs for friendly, approachable characters
   - Angular, modern cartoon style for dynamic, energetic scenes
   - Classic children's book illustration style for timeless, familiar feel
   - Or develop your own unique visual style

3. **Lighting/Atmosphere Inspiration** - Consider these mood settings:
   - Bright sunny day with clear shadows for cheerful, energetic scenes
   - Soft diffused lighting like a cloudy day for gentle, peaceful scenes
   - Warm golden hour lighting for magical, nostalgic moments
   - Cool blue-tinted lighting for calm, serene atmospheres
   - Magical glowing atmosphere for fantastical, enchanting scenes
   - Cozy indoor lighting for intimate, comfortable settings
   - Or create your own unique lighting and atmosphere

Use these as inspiration to create visually distinctive and engaging content.

Here is the script:
{script}

${OUTPUT_FORMAT}
`;

const mediaPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["script"],
    template: mediaPromptTemplate
});

export {mediaPrompt};