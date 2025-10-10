import fs from 'fs';
import { getDirname } from '../../../utils/fileUtils.js';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read style content with fallback to template
let futuristicRobotsStyleContent: string;
const actualPath = path.join(__dirname, 'styles', 'futuristicRobotsStyle.style.txt');
const templatePath = path.join(__dirname, 'styles', 'futuristicRobotsStyle.style.template.txt');

if (fs.existsSync(actualPath)) {
    futuristicRobotsStyleContent = fs.readFileSync(actualPath, 'utf-8');
} else {
    futuristicRobotsStyleContent = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template style for futuristicRobotsStyle. Copy .template.txt to .txt for production use.');
}

export const futuristicRobotsStyle = JSON.parse(futuristicRobotsStyleContent);