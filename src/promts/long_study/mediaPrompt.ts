/**
 * Media Prompt
 * Generates prompts for image and video generation for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';
import fs from 'fs';
import path from 'path';

// Read prompt text with fallback to template
let mediaPromptTemplate: string;
const actualPath = path.join(__dirname, 'mediaPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'mediaPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    mediaPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    mediaPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for mediaPrompt. Copy .template.txt to .txt for production use.');
}

const mediaPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["script"],
    template: mediaPromptTemplate
});

export {mediaPrompt};