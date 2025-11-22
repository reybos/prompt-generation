import {PromptTemplate} from '@langchain/core/prompts';
import { getDirname } from '../../../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read prompt text with fallback to template
let songPromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'songPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'songPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    songPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    songPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for shortStudySongPrompt. Copy .template.txt to .txt for production use.');
}

export const shortStudySongPrompt = new PromptTemplate({
    inputVariables: ["topicDescription"],
    template: songPromptTemplate
});
