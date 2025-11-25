/**
 * Video Prompt Style Suffix for Poems Direct Video
 * Provides a fixed style suffix to append to all video prompts
 */

import { getDirname } from '../../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';

// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read style suffix text with fallback to template
let videoPromptStyleSuffix: string;
const actualPath = path.join(__dirname, 'prompts', 'videoPromptStyle.style.txt');
const templatePath = path.join(__dirname, 'prompts', 'videoPromptStyle.style.template.txt');

if (fs.existsSync(actualPath)) {
    videoPromptStyleSuffix = fs.readFileSync(actualPath, 'utf-8').trim();
} else {
    videoPromptStyleSuffix = fs.readFileSync(templatePath, 'utf-8').trim();
}

/**
 * Get the style suffix to append to video prompts
 * @returns The style suffix string
 */
export function getVideoPromptStyleSuffix(): string {
    return videoPromptStyleSuffix;
}

export { videoPromptStyleSuffix };

