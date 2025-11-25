import {PromptTemplate} from '@langchain/core/prompts';
import { getDirname } from '../../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read prompt text with fallback to template
let videoPromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'videoPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'videoPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    videoPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    videoPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for poemsDirectVideoVideoPrompt. Copy .template.txt to .txt for production use.');
}

export const poemsDirectVideoVideoPrompt = new PromptTemplate({
    inputVariables: ["songLyrics"],
    template: videoPromptTemplate
});

// Функция для логирования видео промта
export function logPoemsDirectVideoVideoPrompt(songLyrics: string): void {
    const fullVideoPrompt = videoPromptTemplate
        .replace('{songLyrics}', songLyrics);
    
    console.log('=== POEMS DIRECT VIDEO PROMPT SENT TO LLM ===');
    console.log('Full Video Prompt:');
    console.log(fullVideoPrompt);
    console.log('=== END POEMS DIRECT VIDEO PROMPT ===');
}

