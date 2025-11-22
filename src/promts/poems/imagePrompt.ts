/**
 * Image Prompt for Poems Songs
 * Generates highly detailed image prompts for poems songs with characters
 */

import {PromptTemplate} from '@langchain/core/prompts';
import { getDirname } from '../../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

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

// Функция возвращает промт с фиксированным стилем
export function createImagePromptWithStyle(styleName: string = 'poems'): PromptTemplate {
    console.log('=== CREATE POEMS IMAGE PROMPT DEBUG ===');
    console.log('Using fixed Poems style:', styleName);

    return imagePrompt;
}

export { imagePrompt };

