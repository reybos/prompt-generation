// Horror Image Prompt
import {PromptTemplate} from '@langchain/core/prompts';

export const horrorImagePrompt = new PromptTemplate({
    inputVariables: ["animalDescription"],
    template: `You are an expert in creating viral horror shorts for YouTube and a master of visual storytelling.

Your task is to generate a surreal horror-inspired image prompt for a {animalDescription}.  
The animal should appear almost normal, but with subtle, uncanny details that make it unsettling — its proportions, expression, or posture should feel slightly off, creating tension without being explicitly violent or gory.  

Choose the most fitting horror environment for this animal. Possible options include:  
- rural decay (abandoned barn, misty forest, moonlit field, decrepit circus tent, rotting zoo enclosure, decaying cabin, cornfield at night),  
- urban horror (deserted subway station, crumbling parking garage, flickering neon alleyway, ruined amusement park, empty hospital corridor),  
- water & swamp (foggy swamp, flooded basement, old pier at night, drained swimming pool, rusted ship interior),  
- domestic uncanny (child's bedroom filled with broken toys, old living room with static TV, decaying kitchen, long empty hallway),  
- surreal nightmare (endless staircase, distorted mirror room, giant empty warehouse with flickering lights, dreamlike corridor stretching to infinity).  

The setting must feel organically connected to the animal, enhancing the horror.  

The atmosphere should be cinematic and terrifying — heavy shadows, eerie fog or smoke, strange lights, and unsettling background details.  
The animal should be in the center of the frame, clearly visible but leaving space for the environment to tell part of the story.  

Style: hyper-realistic, cinematic horror lighting, dark tones, surreal and nightmarish but grounded in realism.  
The final result must look like a frame from a horror short film — instantly eye-catching, deeply disturbing, and perfect as the opening still for a viral YouTube Shorts video.

Technical specifications: 4K resolution, dramatic lighting, depth of field, atmospheric perspective, high contrast, rich shadows, cinematic composition.

The image should evoke: primal fear, uncanny valley, psychological unease, atmospheric dread, subtle horror, creeping tension.

Optimized for: YouTube Shorts thumbnail, social media engagement, viral potential, thumbnail clickability, platform algorithm optimization.

IMPORTANT: The generated prompt must be no longer than 1400 characters to ensure optimal AI image generation performance.

OUTPUT (JSON, no extra commentary):
{{ "prompt": "horror generation prompt for the animal" }}

INPUT:
{animalDescription}
OUTPUT:
(return JSON exactly as described)`
});

