/**
 * Script Prompt
 * Generates a detailed script for a 1–2 minute children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';
import fs from 'fs';
import path from 'path';

// Random seed for consistent character selection within a video
const RANDOM_SEED = Math.floor(Math.random() * 10000);

// Read prompt text with fallback to template
let scriptPromptTemplate: string;
const actualPath = path.join(__dirname, 'scriptPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'scriptPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    scriptPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    scriptPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for scriptPrompt. Copy .template.txt to .txt for production use.');
}

const scriptPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["topic"],
    template: scriptPromptTemplate.replace('{randomSeed}', RANDOM_SEED.toString())
});

export {
    scriptPrompt,
};