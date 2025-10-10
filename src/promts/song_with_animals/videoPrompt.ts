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
    console.warn('⚠️  Using template prompt for songWithAnimalsVideoPrompt. Copy .template.txt to .txt for production use.');
}

export const songWithAnimalsVideoPrompt = new PromptTemplate({
    inputVariables: ["global_style", "image_prompts"],
    template: videoPromptTemplate
});

// Функция для логирования видео промта
export function logVideoPrompt(global_style: string, image_prompts: string): void {
    const fullVideoPrompt = videoPromptTemplate
        .replace('{global_style}', global_style)
        .replace('{image_prompts}', image_prompts);
    
    console.log('=== VIDEO PROMPT SENT TO LLM ===');
    console.log('Full Video Prompt:');
    console.log(fullVideoPrompt);
    console.log('=== END VIDEO PROMPT ===');
} 