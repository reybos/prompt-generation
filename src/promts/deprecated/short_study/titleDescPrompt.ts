import {PromptTemplate} from '@langchain/core/prompts';
import { getDirname } from '../../../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

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
    inputVariables: ["topicDescription", "song_text"],
    template: titleDescPromptTemplate
});

export function logTitleDescPrompt(topicDescription: string, song_text: string): void {
    console.log('\n=== SHORT STUDY TITLE DESC PROMPT ===');
    console.log('Topic Description:', topicDescription);
    console.log('Song Text:', song_text);
    console.log('=====================================\n');
}
