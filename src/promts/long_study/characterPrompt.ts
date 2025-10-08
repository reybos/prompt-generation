/**
 * Character Prompt
 * Generates a detailed character description for a children's educational video
 */

import {PromptTemplate} from '@langchain/core/prompts';
import fs from 'fs';
import path from 'path';

// Read prompt text with fallback to template
let characterPromptTemplate: string;
const actualPath = path.join(__dirname, 'characterPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'characterPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    characterPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    characterPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for characterPrompt. Copy .template.txt to .txt for production use.');
}

const characterPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["title", "description", "narration"],
    template: characterPromptTemplate
});

export {
    characterPrompt,
};