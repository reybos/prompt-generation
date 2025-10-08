import {PromptTemplate} from '@langchain/core/prompts';
import fs from 'fs';
import path from 'path';

// Read prompt text with fallback to template
let titleDescPromptTemplate: string;
const actualPath = path.join(__dirname, 'titleDescPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'titleDescPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    titleDescPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    titleDescPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for horrorTitleDescPrompt. Copy .template.txt to .txt for production use.');
}

export const horrorTitleDescPrompt = new PromptTemplate({
    inputVariables: ["topic", "script"],
    template: titleDescPromptTemplate
});
