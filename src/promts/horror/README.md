# Horror Prompts

This directory contains prompt templates for the horror pipeline, which generates horror-themed content based on animal descriptions.

## Structure

- `imagePrompt.ts` - Generates horror-themed image prompts
- `videoPrompt.ts` - Generates horror-themed video prompts based on image prompts
- `titleDescPrompt.ts` - Generates horror-themed titles and descriptions
- `hashtagsPrompt.ts` - Generates horror-themed hashtags
- `index.ts` - Exports all horror prompts

## Usage

The horror pipeline follows the same structure as the song with animals pipeline:

1. **Image Generation**: Creates horror-themed image prompts for each animal description
2. **Video Generation**: Converts image prompts into video prompts
3. **Content Generation**: Creates titles, descriptions, and hashtags for each animal

## Current Status

All prompts are currently placeholder implementations with TODO comments. They need to be filled with actual horror-specific prompt logic.

## Integration

The horror pipeline is integrated into the main pipeline system and can be accessed via:
```typescript
import { runHorrorPipeline } from '../pipeline/horrorPipeline.js';
```

## Next Steps

1. Implement actual horror-specific prompt logic in each file
2. Test the pipeline with horror content
3. Optimize prompts for horror genre
