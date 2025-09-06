/**
 * Title and Description Prompt for Song with Animals
 * Generates title and description for songs with animal characters targeting broad audience
 */

import {PromptTemplate} from '@langchain/core/prompts';

// const songWithAnimalsTitleDescPromptTemplate: string = `You are a social media expert specializing in viral content optimization.
// Input is a segment from a song with animal characters ({songLyrics}) and its corresponding video prompt ({videoPrompt}).
//
// TASK
// Generate an engaging title and description for a video featuring this song segment and video content, optimized for search and discovery algorithms.
//
// TITLE STRATEGY (Follow proven viral formula):
// • Use the pattern: "[Theme/Setting] Animal Sounds Song | [Additional Context] | [Engagement Hook]"
// • First part: Include theme/setting + "Animal Sounds Song" (e.g., "Farm Animal Sounds Song", "Safari Animal Sounds Song")
// • Second part: Add context like "Animals and [Theme] Song for Kids" or "Nursery Rhyme for Kids"
// • Third part: Include engagement keywords like "Fun Nursery Rhymes", "Learn Animal Names", "Fun Songs"
// • 15-25 words total for optimal YouTube Shorts display
// • Use trending themes and settings when applicable
// • Include the main animal character(s) from this segment
// • Make it sound educational and entertaining
//
// EXAMPLES OF SUCCESSFUL TITLES:
// - "Halloween Farm Animal Sounds Song | Animals and Farm Song for Kids | Fun Nursery Rhymes"
// - "Safari Animal Sounds Song | Nursery Rhyme for Kids - Learn Animal Names and Sounds"
// - "Dinosaur Sounds Song for Kids | Learn Dinosaurs Names | Fun Nursery Rhyme"
//
// DESCRIPTION STRATEGY (Follow proven viral formula):
// • Use longer descriptions like successful channels (150-300 words)
// • Structure: Hook + Song Description + Educational Value + Call to Action
// • Start with engaging hook: "Get ready for [theme] with [song name]!"
// • Describe the song's unique features and animal characters
// • Mention educational benefits (learning animal names, sounds, etc.)
// • Include references to classic songs when applicable
// • Add call-to-action for engagement
// • Use trending keywords: "nursery rhymes", "learning", "educational", "fun songs"
// • Include emojis strategically for engagement
// • Make it sound professional yet entertaining
// • Target both children and parents
//
// OUTPUT (JSON, no extra commentary):
// {{
//   "title": "catchy title here",
//   "description": "engaging description with emojis here"
// }}
//
// INPUT:
// Song Lyrics: {songLyrics}
// Video Prompt: {videoPrompt}
// Global Style: {globalStyle}
//
// OUTPUT:
// (return JSON exactly as described)`;

const songWithAnimalsTitleDescPromptTemplate: string = `You are a senior YouTube content strategist and SEO expert specializing in kids' content and viral Shorts optimization.
You will generate a YouTube TITLE and DESCRIPTION for a children's song video featuring animal characters, based on these inputs:
- Song Lyrics: {songLyrics}
- Video Prompt: {videoPrompt}
- Global Style: {globalStyle}

GOALS:
• Maximize search discoverability (SEO keywords, trending phrases, parent-focused search terms)
• Maximize CTR with curiosity-driven, family-friendly wording
• Appeal to both kids (fun, colorful) and parents (safe, educational)
• Encourage engagement (watch time, likes, comments, subscriptions)
• Keep the description visually engaging with emojis, short sentences, and lists

---

📌 **TITLE STRATEGY**:
• Use this pattern: "[Theme/Setting] Animal Sounds Song | [Extra Context for Kids/Parents] | [Fun Engagement Hook]"
• Include: Theme (Farm, Jungle, Ocean, Space, Safari, etc.), "Animal Sounds Song"
• Add characters or main animals (e.g., "With Cow, Sheep, and Chickens")
• Use fun emojis (🎶 🐄 🐞 🚀 🎃 etc.)
• Keep 15–22 words (optimized for YouTube Shorts display)

💡 TITLE EXAMPLES:
- "Halloween Farm Animal Sounds Song 🎃 | Fun Songs for Kids and Toddlers | Nursery Rhymes with Animals"
- "Robot Insect Adventure 🐞🤖 | Bug Sounds for Toddlers | Fun Learning Songs for Kids"
- "Space Animal Sounds Song 🚀🐱 | Nursery Rhymes for Kids | Educational Songs for Preschoolers"

---

📌 **DESCRIPTION STRATEGY**:
• Length: 120–180 words (shorter than traditional SEO, optimized for Shorts audience)
• Structure:
  1. **HOOK** (fun intro with emojis, set the scene, introduce animals/characters)
  2. **WHAT KIDS LEARN** (bullet list with emojis: sounds, names, vocabulary, movement, imagination)
  3. **STYLE / VIBE** (retro, steampunk, cozy, spooky-but-not-scary, etc. — depending on input)
  4. **CALL TO ACTION** (Subscribe, Like, Comment, Share)
• Emphasize educational value AND fun
• Use playful, parent-friendly tone
• Naturally include keywords: "nursery rhymes", "kids songs", "learning songs", "educational videos for toddlers", "songs for preschoolers"
• End with a strong CTA

---

OUTPUT (STRICT JSON ONLY, NO EXTRA TEXT):
{{
  "title": "Catchy, SEO-optimized video title with emojis",
  "description": "Engaging 120–180 word description with emojis, bullet points, educational value, and a call-to-action"
}}

INPUT:
Song Lyrics: {songLyrics}
Video Prompt: {videoPrompt}
Global Style: {globalStyle}

OUTPUT:
(Return only valid JSON as shown above)
`;

const songWithAnimalsTitleDescPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["songLyrics", "videoPrompt", "globalStyle"],
    template: songWithAnimalsTitleDescPromptTemplate
});

// Функция для логирования title/description промта
export function logTitleDescPrompt(songLyrics: string, videoPrompt: string, globalStyle: string): void {
    const fullTitleDescPrompt = songWithAnimalsTitleDescPromptTemplate
        .replace('{songLyrics}', songLyrics)
        .replace('{videoPrompt}', videoPrompt)
        .replace('{globalStyle}', globalStyle);
    
    console.log('=== TITLE/DESCRIPTION PROMPT SENT TO LLM ===');
    console.log('Full Title/Description Prompt:');
    console.log(fullTitleDescPrompt);
    console.log('=== END TITLE/DESCRIPTION PROMPT ===');
}

export {
    songWithAnimalsTitleDescPrompt,
}; 