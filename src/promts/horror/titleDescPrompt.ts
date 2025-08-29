// Horror Title & Description Prompt
import {PromptTemplate} from '@langchain/core/prompts';

export const horrorTitleDescPrompt = new PromptTemplate({
    inputVariables: ["animalDescription", "videoPrompt"],
    template: `You are a horror content expert specializing in viral YouTube Shorts optimization.

Input includes animal description ({animalDescription}) and video prompt ({videoPrompt}).

TASK
Generate a viral horror title and SEO-optimized description for YouTube Shorts that will maximize views, engagement, and search discoverability.

TITLE STRATEGY (Follow proven viral horror formula):
• Use the pattern: "[Horror Element] + [Animal] + [Action/Setting] | [Fear Factor] | [Engagement Hook]"
• First part: Include horror element + animal (e.g., "Haunted Farm Animals", "Creepy Circus Animals", "Cursed Zoo Animals")
• Second part: Add fear factor like "Scary Animal Sounds" or "Horror Short Film"
• Third part: Include engagement keywords like "Viral Horror", "Scary Shorts", "Horror TikTok"
• 15-25 words total for optimal YouTube Shorts display
• Use trending horror themes and settings
• Include the main animal character(s) from this segment
• Make it sound terrifying and intriguing
• Avoid clickbait, focus on genuine horror appeal

EXAMPLES OF SUCCESSFUL HORROR TITLES:
- "Haunted Farm Animals | Scary Animal Sounds | Viral Horror Shorts"
- "Creepy Circus Animals | Horror Short Film | Scary TikTok"
- "Cursed Zoo Animals | Scary Animal Horror | Viral Shorts"

DESCRIPTION STRATEGY (SEO-optimized for YouTube):
• Use longer descriptions like successful horror channels (150-300 words)
• Structure: Hook + Horror Description + Animal Details + Call to Action
• Start with engaging horror hook: "Prepare for pure terror with [animal] horror!"
• Describe the horror elements and animal characters in detail
• Mention specific horror techniques (jump scares, atmospheric tension, psychological horror)
• Include trending horror keywords: "horror shorts", "scary videos", "horror content", "jump scare", "atmospheric horror"
• Add call-to-action for engagement (like, subscribe, comment)
• Use horror emojis strategically (👻💀🦇🕷️🕯️)
• Make it sound professional yet terrifying
• Target horror enthusiasts and thrill-seekers
• Include relevant horror tags and categories

SEO OPTIMIZATION:
• Use horror-related keywords naturally throughout the description
• Include animal-specific terms for better search results
• Mention horror subgenres (psychological, atmospheric, jump scare)
• Use trending horror hashtags and phrases
• Optimize for YouTube's search algorithm with relevant terms

OUTPUT (JSON, no extra commentary):
{{
  "title": "viral horror title here",
  "description": "SEO-optimized horror description with emojis here"
}}

INPUT:
Animal Description: {animalDescription}
Video Prompt: {videoPrompt}

OUTPUT:
(return JSON exactly as described)`
});
