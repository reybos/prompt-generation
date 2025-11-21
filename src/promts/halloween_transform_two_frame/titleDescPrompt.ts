/**
 * Optimized Title Prompt for Halloween Song Shorts
 * Generates TITLE for kids' Halloween song videos with spooky animal characters, optimized for Shorts growth, SEO, and engagement
 */

import {PromptTemplate} from '@langchain/core/prompts';
import { getDirname } from '../../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read prompt text with fallback to template
let titleDescPromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'titleDescPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'titleDescPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    titleDescPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    titleDescPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for titleDescPrompt. Copy .template.txt to .txt for production use.');
}

const halloweenTransformTwoFrameTitlePrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["songLyrics", "videoPrompt", "globalStyle"],
    template: titleDescPromptTemplate
});

export function logTitlePrompt(songLyrics: string, videoPrompt: string, globalStyle: string): void {
    console.log('\n=== HALLOWEEN TRANSFORM TWO FRAME TITLE PROMPT ===');
    console.log('Song Lyrics:', songLyrics);
    console.log('Video Prompt:', videoPrompt);
    console.log('Global Style:', globalStyle);
    console.log('=====================================\n');
}

// Функция для логирования title промта (алиас для совместимости)
export function halloweenTransformTwoFrameLogTitlePrompt(songLyrics: string, videoPrompt: string, globalStyle: string): void {
    logTitlePrompt(songLyrics, videoPrompt, globalStyle);
}

export {
    halloweenTransformTwoFrameTitlePrompt,
};

