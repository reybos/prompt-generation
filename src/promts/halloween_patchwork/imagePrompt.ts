/**
 * Image Prompt for Halloween Patchwork
 * Generates image prompts with hardcoded Halloween Patchwork style
 */

import {PromptTemplate} from '@langchain/core/prompts';
import { getDirname } from '../../utils/fileUtils.js';
import fs from 'fs';
import path from 'path';


// Get __dirname equivalent for ES modules
const __dirname = getDirname(import.meta.url);

// Read prompt text with fallback to template
let imagePromptTemplate: string;
const actualPath = path.join(__dirname, 'prompts', 'imagePrompt.prompt.txt');
const templatePath = path.join(__dirname, 'prompts', 'imagePrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    imagePromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    imagePromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for imagePrompt. Copy .template.txt to .txt for production use.');
}

// Hardcoded Halloween Patchwork style configuration
const styleConfiguration = `
STYLE NAME: Halloween
DESCRIPTION: Family-friendly spooky Frankenstein-inspired 3D cartoon style

CHARACTER STYLE: Characters are creatures stitched together from different parts. Bodies show clear, thick black stitches holding different sections together, with visible thread ends and uneven seams. Each body part has distinct textures and colors - some parts are furry, others are smooth fabric, creating a mismatched appearance. Some parts have small fabric patches sewn on like repairs. Eyes: glowing green orbs without pupils, large and playful, giving a magical glow instead of menace. Mouths are softly smiling or curious, sometimes with a hint of small teeth. Characters have a handcrafted, toy-like look with visible stitching details. The overall appearance is spooky yet charming — like friendly Halloween patchwork toys that are a little eerie but meant to amuse rather than frighten.

ENVIRONMENT STYLE: Whimsical Halloween-inspired 3D backdrops that feel spooky but family-friendly. Settings may include crooked trees silhouetted against a dark sky, patches of light fog, an old wooden fence, a haunted barn, or a glowing full moon. Occasional props like lanterns, scattered autumn leaves, or a few glowing jack-o'-lanterns can add warmth and charm — but they are optional, not dominant. Atmosphere should remain playful and atmospheric, closer to a family Halloween special than to true horror. Backgrounds can vary between misty forests, rustic farmyards, or open fields under moonlight, always with soft lighting and a magical Halloween vibe.

COLOR PALETTE: Primary colors: muted greens, bluish greys, soft blacks, dark fabric tones. Accent colors: glowing green (eyes), pumpkin orange, neon purple, bright red for accessories. Backgrounds: midnight blue, foggy teal, violet, dark silhouettes. Strong contrast between muted bodies and glowing details. The green eyes provide stark contrast against dark surroundings, but always with a playful warmth.

RENDER STYLE: High-quality 3D animation, Pixar-like smooth surfaces with Tim Burton/Coraline atmosphere. Rounded proportions (big head, short limbs) with clear fabric seams, stitches, and patches. Glowing eyes as the main light source, casting a faint magical green glow on surroundings. Lighting mixes moonlight + pumpkin glow for a soft cozy feel. Movements slightly puppet-like but bouncy and playful. Textures are detailed but not realistic, giving a handcrafted quality that feels whimsical rather than scary.

IMPORTANT: The global_style you generate should combine the base cartoon/animated requirements with these style enhancements to create a consistent visual approach for all images in the group.
`;

// Replace styleConfiguration placeholder in template
const fullPromptTemplate = imagePromptTemplate.replace('{styleConfiguration}', styleConfiguration);

// Create image prompt without style parameter
export function createImagePrompt(): PromptTemplate {
    return new PromptTemplate({
        inputVariables: ["songLyrics"],
        template: fullPromptTemplate
    });
}

export {
    createImagePrompt as imagePrompt
};

