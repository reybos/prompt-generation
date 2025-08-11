import { z } from 'zod';

/**
 * Script schema
 */
export const ScriptSchema = z.object({
    introduction: z.object({
        title: z.string(),
        description: z.string(),
        narration: z.string(),
    }),
    scenes: z.array(z.object({
        title: z.string(),
        description: z.string(),
        narration: z.string(),
        visuals: z.string(),
        interaction: z.string().optional(),
    })),
    finale: z.object({
        summary: z.string(),
        narration: z.string(),
        callToAction: z.string().optional(),
    }),
});

/**
 * Character schema
 */
export const CharacterSchema = z.object({
    name: z.string(),
    appearance: z.string(),
    personality: z.string(),
    gestures: z.array(z.string()),
    voiceDescription: z.string(),
});

/**
 * Media prompt schema
 */
export const MediaPromptSchema = z.object({
    introduction: z.object({
        description: z.string(),
        prompt: z.string(),
    }),
    scenes: z.array(z.object({
        description: z.string(),
        prompt: z.string(),
    })),
    finale: z.object({
        description: z.string(),
        prompt: z.string(),
    }),
});

/**
 * Enhanced media prompt schema
 */
export const EnhancedMediaPromptSchema = z.object({
    introduction: z.object({
        description: z.string(),
        prompt: z.string(),
    }),
    scenes: z.array(z.object({
        description: z.string(),
        prompt: z.string(),
    })),
    finale: z.object({
        description: z.string(),
        prompt: z.string(),
    }),
    styleGuide: z.object({
        visualStyle: z.string(),
        colorPalette: z.string(),
        characterConsistency: z.string(),
    }),
});

/**
 * Music suggestion schema
 */
export const MusicSuggestionSchema = z.object({
    overallMood: z.string(),
    recommendedTracks: z.array(z.object({
        title: z.string(),
        description: z.string(),
        mood: z.string(),
        tempo: z.string(),
        section: z.string().optional(),
    })),
});

/**
 * Title and description schema
 */
export const TitleDescriptionSchema = z.object({
    title: z.string(),
    shortDescription: z.string(),
    longDescription: z.string(),
    keywords: z.array(z.string()),
});

/**
 * Complete content package schema
 */
export const ContentPackageSchema = z.object({
    script: ScriptSchema,
    character: CharacterSchema,
    media: MediaPromptSchema,
    enhancedMedia: EnhancedMediaPromptSchema,
    narration: z.any().optional(),
    music: MusicSuggestionSchema,
    titleDesc: TitleDescriptionSchema,
    hashtags: z.string(),
});

/**
 * Song with animals schemas
 */
export const SongWithAnimalsInputItemSchema = z.object({
    lyrics: z.string(),
});

export const SongWithAnimalsInputSchema = z.array(SongWithAnimalsInputItemSchema);

export const SongWithAnimalsImagePromptSchema = z.object({
    line: z.string(),
    prompt: z.string(),
});

export const SongWithAnimalsVideoPromptSchema = z.object({
    line: z.string(),
    video_prompt: z.string(),
});

export const SongWithAnimalsOutputSchema = z.object({
    global_style: z.string(),
    prompts: z.array(SongWithAnimalsImagePromptSchema),
    video_prompts: z.array(SongWithAnimalsVideoPromptSchema),
    titles: z.array(z.string()),
    descriptions: z.array(z.string()),
    hashtags: z.array(z.string()),
});