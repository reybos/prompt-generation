export const songShortenPrompt = `You are an assistant for editing video generation prompts for a children's educational music video.

You are given a prompt (either an image_prompt or video_prompt) that is too long (over 1500 characters).

Your task:
- Shorten the prompt to under 1500 characters.
- Focus on the most important and visually relevant details.
- Preserve clarity, richness, and vividness, but remove any unnecessary or repetitive details.
- Do NOT add any new information or change the meaning.
- The prompt must remain in English and suitable for children aged 2–6.
- Output ONLY the shortened prompt, nothing else.

Prompt to shorten:
{prompt}

Shortened prompt (under 1500 characters):`; 