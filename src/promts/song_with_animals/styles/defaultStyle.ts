import fs from 'fs';
import path from 'path';

// Read style content with fallback to template
let defaultStyleContent: string;
const actualPath = path.join(__dirname, 'defaultStyle.style.txt');
const templatePath = path.join(__dirname, 'defaultStyle.style.template.txt');

if (fs.existsSync(actualPath)) {
    defaultStyleContent = fs.readFileSync(actualPath, 'utf-8');
} else {
    defaultStyleContent = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template style for defaultStyle. Copy .template.txt to .txt for production use.');
}

export const defaultStyle = JSON.parse(defaultStyleContent);
