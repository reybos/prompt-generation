import fs from 'fs';
import path from 'path';

// Read style content with fallback to template
let futuristicRobotsStyleContent: string;
const actualPath = path.join(__dirname, 'futuristicRobotsStyle.style.txt');
const templatePath = path.join(__dirname, 'futuristicRobotsStyle.style.template.txt');

if (fs.existsSync(actualPath)) {
    futuristicRobotsStyleContent = fs.readFileSync(actualPath, 'utf-8');
} else {
    futuristicRobotsStyleContent = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template style for futuristicRobotsStyle. Copy .template.txt to .txt for production use.');
}

export const futuristicRobotsStyle = JSON.parse(futuristicRobotsStyleContent);