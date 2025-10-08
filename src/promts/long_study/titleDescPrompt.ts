/**
 * Title and Description Prompt
 * Generates a highly SEO-optimized title and long-form description for a children's educational YouTube video
 */

import { PromptTemplate } from '@langchain/core/prompts';
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
    console.warn('⚠️  Using template prompt for titleDescPrompt. Copy .template.txt to .txt for production use.');
}

const titleDescPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["topic", "script"],
    template: titleDescPromptTemplate
});

export {
    titleDescPrompt,
};