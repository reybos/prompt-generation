/**
 * Title Prompt for Poems Direct Video
 * Generates TITLE for kids' poems song videos with characters, optimized for Shorts growth, SEO, and engagement
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
    console.warn('⚠️  Using template prompt for poemsDirectVideoTitlePrompt. Copy .template.txt to .txt for production use.');
}

const poemsDirectVideoTitlePrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["songLyrics", "videoPrompt"],
    template: titleDescPromptTemplate
});

export function logPoemsDirectVideoTitlePrompt(songLyrics: string, videoPrompt: string): void {
    console.log('\n=== POEMS DIRECT VIDEO TITLE PROMPT ===');
    console.log('Song Lyrics:', songLyrics);
    console.log('Video Prompt:', videoPrompt);
    console.log('================================\n');
}

export {
    poemsDirectVideoTitlePrompt,
};

