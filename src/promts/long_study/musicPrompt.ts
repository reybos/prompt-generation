/**
 * Music Prompt
 * Generates a detailed description for an original, wordless (instrumental) song for a children's educational video, suitable for use with an AI music generation tool.
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { getDirname } from '../../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read prompt text with fallback to template
let musicPromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'musicPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'musicPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    musicPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    musicPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for musicPrompt. Copy .template.txt to .txt for production use.');
}

const musicPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["topic", "script"],
    template: musicPromptTemplate
});

export {
    musicPrompt,
};