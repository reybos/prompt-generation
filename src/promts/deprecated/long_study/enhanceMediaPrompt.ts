/**
 * Enhance Media Prompt
 * Improves media prompts for consistency across scenes
 */

import { PromptTemplate } from '@langchain/core/prompts';
import fs from 'fs';
import path from 'path';
import { getDirname } from '../../../utils/fileUtils.js';

// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read prompt text with fallback to template
let enhanceMediaPromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'enhanceMediaPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'enhanceMediaPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    enhanceMediaPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    enhanceMediaPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for enhanceMediaPrompt. Copy .template.txt to .txt for production use.');
}

const enhanceMediaPrompt = new PromptTemplate({
    inputVariables: ["media_prompts", "script"],
    template: enhanceMediaPromptTemplate
});

// Read prompt text with fallback to template
let shortenVideoPromptTemplate: string;
const shortenActualPath = path.join(__dirname, 'prompts', 'shortenVideoPrompt.prompt.txt');
const shortenTemplatePath = path.join(__dirname, 'prompts', 'shortenVideoPrompt.prompt.template.txt');

if (fs.existsSync(shortenActualPath)) {
    shortenVideoPromptTemplate = fs.readFileSync(shortenActualPath, 'utf-8');
} else {
    shortenVideoPromptTemplate = fs.readFileSync(shortenTemplatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for shortenVideoPrompt. Copy .template.txt to .txt for production use.');
}

const shortenVideoPrompt = new PromptTemplate({
    inputVariables: ["video_prompt"],
    template: shortenVideoPromptTemplate
});

export { enhanceMediaPrompt, shortenVideoPrompt, };