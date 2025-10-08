/**
 * Image Prompt for Song with Animals
 * Generates image prompts for songs with animal characters
 */

import {PromptTemplate} from '@langchain/core/prompts';
import { getStyle, VisualStyle } from './styles/styleConfig.js';
import fs from 'fs';
import path from 'path';

// Read prompt text with fallback to template
let imagePromptTemplate: string;
const actualPath = path.join(__dirname, 'imagePrompt.prompt.txt');
const templatePath = path.join(__dirname, 'imagePrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    imagePromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    imagePromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for imagePrompt. Copy .template.txt to .txt for production use.');
}

const imagePrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["songLyrics", "styleConfiguration"],
    template: imagePromptTemplate
});

// Функция для создания промта с конкретным стилем
export function createImagePromptWithStyle(styleName: string = 'default'): PromptTemplate {
    console.log('=== CREATE IMAGE PROMPT DEBUG ===');
    console.log('Requested styleName:', styleName);
    
    try {
        const style = getStyle(styleName);
        console.log('Resolved style:', style.name, 'Display name:', style.displayName);
        
        const styleConfiguration = `
STYLE NAME: ${style.displayName}
DESCRIPTION: ${style.description}

CHARACTER STYLE: ${style.characterStyle}

ENVIRONMENT STYLE: ${style.environmentStyle}

COLOR PALETTE: ${style.colorPalette}

RENDER STYLE: ${style.renderStyle || 'High-quality 3D render with realistic details'}

IMPORTANT: The global_style you generate should combine the base cartoon/animated requirements with these style enhancements to create a consistent visual approach for all images in the group.
`;

        // Логируем полный промт в консоль
        const fullPrompt = imagePromptTemplate.replace('{styleConfiguration}', styleConfiguration);
        console.log('=== IMAGE PROMPT SENT TO LLM ===');
        console.log('Style:', styleName, '-> Resolved to:', style.name);
        console.log('Full Prompt:');
        console.log(fullPrompt);
        console.log('=== END IMAGE PROMPT ===');

        return new PromptTemplate({
            inputVariables: ["songLyrics"],
            template: fullPrompt
        });
    } catch (error) {
        console.error('=== STYLE RESOLUTION ERROR ===');
        console.error('Failed to resolve style:', styleName);
        console.error('Error:', error);
        console.error('=== END STYLE RESOLUTION ERROR ===');
        throw error;
    }
}

export {
    imagePrompt
};