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
 * Song video generation schemas
 */
export const SongVideoSegmentSchema = z.object({
    duration: z.number().refine(val => val === 6 || val === 10, {
        message: "Duration must be 6 or 10 seconds"
    }),
    content: z.string(),
});

export const SongVideoInputItemSchema = z.object({
    topic: z.string(),
    segments: z.array(SongVideoSegmentSchema),
});

export const SongVideoInputSchema = z.array(SongVideoInputItemSchema);

export const SongVideoSceneSchema = z.object({
    scene: z.number(),
    duration: z.number(),
    image_prompt: z.string().optional(),
    video_prompt: z.string(),
});

export const SongVideoOutputSchema = z.object({
    scenes: z.array(SongVideoSceneSchema),
    enhancedMedia: z.array(SongVideoSceneSchema),
    title: z.string(),
    description: z.string(),
    hashtags: z.string(),
});