/**
 * Image Prompt for Halloween Songs
 * Generates highly detailed image prompts for Halloween songs with spooky patchwork animal characters
 */

import {PromptTemplate} from '@langchain/core/prompts';
import fs from 'fs';
import path from 'path';

// Read prompt text with fallback to template
let imagePromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'imagePrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'imagePrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    imagePromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    imagePromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for imagePrompt. Copy .template.txt to .txt for production use.');
}

const imagePrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["songLyrics"],
    template: imagePromptTemplate
});

// Функция возвращает промт с фиксированным Halloween стилем
export function createImagePromptWithStyle(styleName: string = 'halloweenPatchwork'): PromptTemplate {
    console.log('=== CREATE HALLOWEEN IMAGE PROMPT DEBUG ===');
    console.log('Using fixed Halloween style:', styleName);

    return imagePrompt;
}

export { imagePrompt };