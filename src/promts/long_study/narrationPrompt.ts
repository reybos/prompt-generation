/**
 * Narration Prompt
 * Generates detailed narration text for each scene of a children's educational video, based on the script and enhanced media prompts.
 */

import { PromptTemplate } from '@langchain/core/prompts';
import fs from 'fs';
import path from 'path';

// Read prompt text with fallback to template
let narrationPromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'narrationPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'narrationPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    narrationPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    narrationPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for narrationPrompt. Copy .template.txt to .txt for production use.');
}

const narrationPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["script", "enhancedMedia"],
    template: narrationPromptTemplate
});

export {
    narrationPrompt,
}; 