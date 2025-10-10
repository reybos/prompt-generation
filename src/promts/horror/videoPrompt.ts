// Horror Video Prompt
import {PromptTemplate} from '@langchain/core/prompts';
import { getDirname } from '../../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read prompt text with fallback to template
let horrorVideoPromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'videoPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'videoPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    horrorVideoPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    horrorVideoPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for horrorVideoPrompt. Copy .template.txt to .txt for production use.');
}

export const horrorVideoPrompt = new PromptTemplate({
    inputVariables: ["image_prompts"],
    template: horrorVideoPromptTemplate
});