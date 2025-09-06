// Short Study Title and Description Prompt
// Generates SEO-optimized title and description for children's educational videos

import {PromptTemplate} from '@langchain/core/prompts';

export const shortStudyTitleDescPrompt = new PromptTemplate({
    inputVariables: ["topicDescription", "song_text"],
    template: `You are a senior YouTube content strategist and SEO expert specializing in **children's educational YouTube Shorts**. 

Input: study topic description ({topicDescription}) and song text ({song_text}).

TASK:
1. Generate an **engaging, SEO-optimized title** (max 70 characters) for toddlers (ages 2-6) and parents. Make it catchy, curiosity-driven, and include main keywords from the topic (e.g., "firefighter song", "builder song", "animal sounds").  
2. Generate an **educational and fun description** (up to 1000 characters) optimized for YouTube search, following this structure:  
   - Hook: 1-2 sentences that grab attention  
   - Learning Summary: what children will learn (vocabulary, sounds, actions, pretend play)  
   - Parent Appeal: why this is safe, educational, and engaging  
   - Call-to-Action: like, subscribe, watch more  
   - Naturally include relevant keywords from topic and song text  
   - Use playful emojis to make it friendly for kids and parents  

3. Make description **ONE continuous string** with escaped newlines (\\n) and quotes (\\"), fully suitable for **YouTube Shorts format**.  
4. Avoid repetition, filler phrases, and overly long blocks. Keep it **clear, concise, and persuasive**.  
5. Ensure **SEO keywords are in the first 1-2 sentences** where possible.  

CRITICAL OUTPUT FORMAT:
1. Return ONLY valid JSON, no markdown or extra text  
2. Start with {{ and end with }}  
3. Double quotes for all strings  
4. Escape all special characters:
   - Newlines: \\n
   - Quotes: \\"  
   - Backslashes: \\\\

EXAMPLE OUTPUT:
{{
  "title": "Fun Learning Song for Kids",
  "description": "Sing, clap, and dance along with this fun kids song!\\n\\nWhat kids will learn:\\n- Basic concepts\\n- Vocabulary\\n- Movement skills\\n\\nSafe, parent-approved content! Subscribe for more fun learning videos."
}}

INPUT:
Topic: {topicDescription}
Song Text: {song_text}

OUTPUT (JSON ONLY):`
});

export function logTitleDescPrompt(topicDescription: string, songText: string, globalStyle: string): void {
  console.log('\n=== SHORT STUDY TITLE & DESCRIPTION PROMPT ===');
  console.log('Topic Description:', topicDescription);
  console.log('Song Text:', songText);
  console.log('Global Style:', globalStyle);
  console.log('===============================================\n');
}
