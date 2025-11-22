/**
 * Hashtags Prompt
 * Generates hashtags for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { getDirname } from '../../../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read prompt text with fallback to template
let hashtagsPromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'hashtagsPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'hashtagsPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    hashtagsPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    hashtagsPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for hashtagsPrompt. Copy .template.txt to .txt for production use.');
}

const hashtagsPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["topic", "script", "channel"],
    template: hashtagsPromptTemplate
});

export {
    hashtagsPrompt,
};