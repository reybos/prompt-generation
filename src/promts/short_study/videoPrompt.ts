import {PromptTemplate} from '@langchain/core/prompts';
import fs from 'fs';
import path from 'path';

// Read prompt text with fallback to template
let videoPromptTemplate: string;
const actualPath = path.join(__dirname, 'videoPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'videoPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    videoPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    videoPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for shortStudyVideoPrompt. Copy .template.txt to .txt for production use.');
}

export const shortStudyVideoPrompt = new PromptTemplate({
    inputVariables: ["topic", "script"],
    template: videoPromptTemplate
});
