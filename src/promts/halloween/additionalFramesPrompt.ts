import { PromptTemplate } from '@langchain/core/prompts';
import fs from 'fs';
import path from 'path';

// Read prompt text with fallback to template
let additionalFramesPromptTemplate: string;
const actualPath = path.join(__dirname, 'additionalFramesPrompt.prompt.txt');
const templatePath = path.join(__dirname, 'additionalFramesPrompt.prompt.template.txt');

if (fs.existsSync(actualPath)) {
    additionalFramesPromptTemplate = fs.readFileSync(actualPath, 'utf-8');
} else {
    additionalFramesPromptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.warn('⚠️  Using template prompt for halloweenGroupImagePrompt. Copy .template.txt to .txt for production use.');
}

/**
 * Halloween group image prompt template
 * Creates group thumbnails for every 3 characters
 */
export const halloweenGroupImagePrompt = new PromptTemplate({ 
    inputVariables: ["globalStyle", "prompts"],
    template: additionalFramesPromptTemplate 
});

/**
 * Halloween group video prompt template
 * Creates animated video prompts for group thumbnails
 */
export const halloweenGroupVideoPrompt = PromptTemplate.fromTemplate(`
You are an expert in creating short animated video prompts for YouTube. You will receive a description of a static illustration showing three characters and their environment. Your task is to transform it into a video description with subtle, natural motions.

Rules:
	•	Characters must remain firmly on the ground, with no feet or limbs lifting off.
	•	Movements are minimal, calm, and natural (gentle breathing, slight body sway, slow head tilt, subtle finger or fabric motions).
	•	Each character should have distinct but very simple movements that fit its nature.
	•	No blinking, no speaking, no large gestures, no rotation around their axis.
	•	Characters stay in place.
	•	Environment has soft background motion (mist drifting, lanterns flickering, shadows shifting).
	•	Keep the same style, mood, and atmosphere as in the original image prompt.
	•	**CRITICAL: The final video prompt must be NO LONGER than 1500 characters. Be concise and precise.**

Format of the answer:
Rewrite the scene description in this format:
A group of three [style] characters stand together in [environment]:
 • Character 1 — [short physical description]. [Describe its minimal, subtle motions].  
 • Character 2 — [short physical description]. [Describe its minimal, subtle motions].  
 • Character 3 — [short physical description]. [Describe its minimal, subtle motions].  

Environment Animation:  
[Describe subtle, looping environmental motions].  

Style & Movement Rules:  
[Summarize that characters remain still on the ground with only minimal in-place motions, no blinking, no speaking, no exaggerated actions].  

Group Image Prompt:
{groupImagePrompt}

Return your response as a JSON object with the following structure:
{{
  "group_video_prompt": "The animated video prompt for the group scene"
}}
`);

/**
 * Log the group image prompt for debugging
 * @param globalStyle - The global style
 * @param prompts - The three character prompts
 */
export function logHalloweenGroupImagePrompt(
  globalStyle: string,
  prompts: string
): void {
  console.log('=== HALLOWEEN GROUP IMAGE PROMPT ===');
  console.log('Global Style:', globalStyle);
  console.log('Three Character Prompts:', prompts);
  console.log('====================================');
}

/**
 * Log the group video prompt for debugging
 * @param groupImagePrompt - The group image prompt
 */
export function logHalloweenGroupVideoPrompt(
  groupImagePrompt: string
): void {
  console.log('=== HALLOWEEN GROUP VIDEO PROMPT ===');
  console.log('Group Image Prompt:', groupImagePrompt);
  console.log('====================================');
}
