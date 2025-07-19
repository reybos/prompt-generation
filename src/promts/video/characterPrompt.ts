/**
 * Character Prompt
 * Generates a detailed character description for a children's educational video
 */

import {PromptTemplate} from '@langchain/core/prompts';

const characterPromptTemplate: string = `
You are a scriptwriter and character designer for an animated children's YouTube channel (Shorts, ages 2–6).
I will provide you with an introduction for a short video, which includes information about the main character.
Your task is to generate a detailed and consistent character description in English that can be used for visual generation in all scenes of the video.

Your character description should include:
* Character type (animal, child, creature, toy, etc.)
* Name suggestion (if appropriate)
* Gender (male, female, or neutral) for appropriate voice acting
* Main colors and appearance (fur/skin/clothing, eyes, size, accessories, unique features)
* Consistent style (cartoonish, friendly, appealing to kids)
* Personality and typical emotions (cheerful, curious, caring, brave, etc.)
* Signature gestures or movements (not just waving; use unique actions and habits)
* Typical outfit or favorite item (for example: always wears a helmet, a scarf, a backpack, etc.)
* Short background or fun fact (where the character lives, favorite thing to do)

Example input:
Introduction:
Title: "Learning About Machines"
Description: A kitten wearing a helmet greets the viewers and introduces them to different machines in the city.
Narration: "Hi, friend! Today we'll see how different machines work in the city!"

Example output:
{{
 "character_type": "Animal — kitten",
 "name": "Max the Kitten",
 "gender": "male",
 "appearance": "Max is a small, fluffy, cartoon-style grey kitten with bright green eyes and a cute pink nose. He always wears a shiny yellow safety helmet (slightly oversized for his head) and a red vest with reflective stripes, like a real little builder. Max's whiskers are extra long and curl up at the ends.",
 "personality": "Max is adventurous, cheerful, and loves to learn about anything that moves. He's very friendly and loves explaining things to his friends.",
 "gestures": "Max often sits on his tail and spins enthusiastically in place when excited. He loves to tap his helmet gently when thinking.",
 "outfit": "Max always wears his helmet and builder's vest whenever he talks about vehicles or city adventures.",
 "background": "He dreams of one day driving a real fire truck."
}}

Introduction:
Title: {title}
Description: {description}
Narration: {narration}
Return the result in the above JSON format without any markdown formatting or code blocks.
`;

const characterPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["title", "description", "narration"],
    template: characterPromptTemplate
});

export {
    characterPrompt,
};