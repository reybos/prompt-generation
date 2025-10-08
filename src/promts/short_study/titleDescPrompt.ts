import {PromptTemplate} from '@langchain/core/prompts';
import fs from 'fs';
import path from 'path';

// Read prompt text with fallback to template
let titleDescPromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'titleDescPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'titleDescPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    titleDescPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    titleDescPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for shortStudyTitleDescPrompt. Copy .template.txt to .txt for production use.');
}

export const shortStudyTitleDescPrompt = new PromptTemplate({
    inputVariables: ["topic", "script"],
    template: titleDescPromptTemplate
});

export function logTitleDescPrompt(topic: string, script: string): void {
    console.log('\n=== SHORT STUDY TITLE DESC PROMPT ===');
    console.log('Topic:', topic);
    console.log('Script:', script);
    console.log('=====================================\n');
}
