import fs from 'fs';
import { getDirname } from '../../../utils/fileUtils.js';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read style content with fallback to template
let defaultStyleContent: string;
const actualPath = path.join(__dirname, 'styles', 'defaultStyle.style.txt');
const templatePath = path.join(__dirname, 'styles', 'defaultStyle.style.template.txt');

if (fs.existsSync(actualPath)) {
    defaultStyleContent = fs.readFileSync(actualPath, 'utf-8');
} else {
    defaultStyleContent = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template style for defaultStyle. Copy .template.txt to .txt for production use.');
}

export const defaultStyle = JSON.parse(defaultStyleContent);
