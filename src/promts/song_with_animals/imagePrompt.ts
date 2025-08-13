/**
 * Image Prompt for Song with Animals
 * Generates image prompts for children's songs with animal characters
 */

import {PromptTemplate} from '@langchain/core/prompts';
import { getStyle, VisualStyle } from './styles/styleConfig.js';

const imagePromptTemplate: string = `You are a senior visual director and prompt engineer specializing in children's content for kids' shorts.
Input is a sequence of valid call-and-response lines from a children\'s song ({songLyrics}).

VISUAL STYLE CONFIGURATION:
{styleConfiguration}

TASK
1. Use the lines in the given order; each line will get exactly one image prompt.
2. Use the provided visual style configuration to enhance and modify the base style.
3. Background rule: every image gets a background that fits the character\'s nature and the specified environment style. The background must stay uncluttered and secondary to the character.
4. For each line craft an English prompt:
detailed description of the character, pose, emotion, background concept per rule above, colors, lighting, camera, keywords

BASE STYLE REQUIREMENTS (apply to all images):
• Cartoon/animated style, NOT realistic, photographic, or 3D rendered
• Characters should look at camera or slightly to the side (3/4 view)
• Colorful, friendly, highly detailed, eye-catching
• Flat, 2D cartoon rendering with bold outlines and simple shading
• Exaggerated, expressive features typical of cartoon animation
• NO text, letters, words, symbols, or any written content on the image
• NO speech bubbles, signs, labels, or any textual elements
• NO sound effects, sound waves, or any visual representations of sounds

STYLE ENHANCEMENTS:
• Apply the specified character style from the visual configuration
• Use the specified environment style for backgrounds
• Follow the specified color palette from the visual configuration
• The style configuration should enhance and modify the base requirements, not replace them

GLOBAL STYLE GENERATION:
• Create a single "global_style" that describes the overall visual approach for all images
• This global style should combine the base requirements with the selected style enhancements
• It should ensure all images in the group have consistent visual characteristics
• Write this as ONE comprehensive sentence that covers art style, rendering approach, and visual mood

OUTPUT (JSON, no extra commentary):
{{ "global_style": "comprehensive global style description for all images", "prompts": [ {{ "line": "original song line", "prompt": "generation prompt for image #1" }}, {{ "line": "original song line", "prompt": "generation prompt for image #2" }} ... ] }}
Return valid JSON, escape all inner double quotes

INPUT:
{songLyrics}
OUTPUT:
(return JSON exactly as described)`;

const imagePrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["songLyrics", "styleConfiguration"],
    template: imagePromptTemplate
});

// Функция для создания промта с конкретным стилем
export function createImagePromptWithStyle(styleName: string = 'default'): PromptTemplate {
    const style = getStyle(styleName);
    
    const styleConfiguration = `
STYLE NAME: ${style.displayName}
DESCRIPTION: ${style.description}

CHARACTER STYLE ENHANCEMENTS: ${style.characterStyle}

ENVIRONMENT STYLE ENHANCEMENTS: ${style.environmentStyle}

COLOR PALETTE ENHANCEMENTS: ${style.colorPalette}

IMPORTANT: The global_style you generate should combine the base cartoon/animated requirements with these style enhancements to create a consistent visual approach for all images in the group.
`;

    return new PromptTemplate({
        inputVariables: ["songLyrics"],
        template: imagePromptTemplate.replace('{styleConfiguration}', styleConfiguration)
    });
}

export {
    imagePrompt
};