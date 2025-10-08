import fs from 'fs';
import path from 'path';

// Read style content with fallback to template
let halloweenPatchworkStyleContent: string;
const actualPath = path.join(__dirname, 'halloweenPatchworkStyle.style.txt');
const templatePath = path.join(__dirname, 'halloweenPatchworkStyle.style.template.txt');

if (fs.existsSync(actualPath)) {
    halloweenPatchworkStyleContent = fs.readFileSync(actualPath, 'utf-8');
} else {
    halloweenPatchworkStyleContent = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template style for halloweenPatchworkStyle. Copy .template.txt to .txt for production use.');
}

export const halloweenPatchworkStyle = JSON.parse(halloweenPatchworkStyleContent);