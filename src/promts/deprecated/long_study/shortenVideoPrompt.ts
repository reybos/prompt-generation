import { PromptTemplate } from '@langchain/core/prompts';
import { getDirname } from '../../../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read prompt text with fallback to template
let shortenVideoPromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'shortenVideoPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'shortenVideoPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    shortenVideoPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    shortenVideoPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for shortenVideoPrompt. Copy .template.txt to .txt for production use.');
}

const shortenVideoPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["video_prompt"],
    template: shortenVideoPromptTemplate
});

export { shortenVideoPrompt }; 