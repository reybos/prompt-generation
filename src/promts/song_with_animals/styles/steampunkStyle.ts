import fs from 'fs';
import { getDirname } from '../../../utils/fileUtils.js';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read style content with fallback to template
let steampunkStyleContent: string;
const actualPath = path.join(__dirname, 'styles', 'steampunkStyle.style.txt');
const templatePath = path.join(__dirname, 'styles', 'steampunkStyle.style.template.txt');

if (fs.existsSync(actualPath)) {
    steampunkStyleContent = fs.readFileSync(actualPath, 'utf-8');
} else {
    steampunkStyleContent = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template style for steampunkStyle. Copy .template.txt to .txt for production use.');
}

export const steampunkStyle = JSON.parse(steampunkStyleContent);
