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
    console.warn('⚠️  Using template prompt for horrorImagePrompt. Copy .template.txt to .txt for production use.');
}

export const horrorImagePrompt = new PromptTemplate({
    inputVariables: ["topic", "script"],
    template: imagePromptTemplate
});
