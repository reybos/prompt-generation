import fs from 'fs';
import path from 'path';

// Read style content with fallback to template
let retroRobotsStyleContent: string;
const actualPath = path.join(__dirname, 'retroRobotsStyle.style.txt');
const templatePath = path.join(__dirname, 'retroRobotsStyle.style.template.txt');

if (fs.existsSync(actualPath)) {
    retroRobotsStyleContent = fs.readFileSync(actualPath, 'utf-8');
} else {
    retroRobotsStyleContent = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template style for retroRobotsStyle. Copy .template.txt to .txt for production use.');
}

export const retroRobotsStyle = JSON.parse(retroRobotsStyleContent);
