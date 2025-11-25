/* START GENAI */
/**
 * Pipeline schemas and type definitions
 */

import { z } from 'zod';

/**
 * LLM request tracking information schema
 */
export const LLMRequestSchema = z.object({
    prompt: z.string(), // The formatted prompt that was sent to LLM (template with inserted params)
    systemPrompt: z.string(), // The prompt template (instructions/rules before data insertion)
    params: z.record(z.string(), z.any()), // Parameters that were inserted into placeholders
    model: z.string(), // The model version used
    requestId: z.string().optional(), // Request ID if available
});

/**
 * Script component schema
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
 * Character component schema
 */
export const CharacterSchema = z.object({
    name: z.string(),
    appearance: z.string(),
    personality: z.string(),
    gestures: z.array(z.string()),
    voiceDescription: z.string(),
});

/**
 * Media prompt component schema
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
 * Enhanced media prompt component schema
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
 * Music suggestion component schema
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
 * Title and description component schema
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
    media: MediaPromptSchema,
    enhancedMedia: EnhancedMediaPromptSchema,
    narration: z.any().optional(),
    music: MusicSuggestionSchema,
    titleDesc: TitleDescriptionSchema,
    hashtags: z.string(),
    requests: z.array(LLMRequestSchema).optional(),
});

/**
 * Song with animals input item schema
 */
export const SongWithAnimalsInputItemSchema = z.object({
    lyrics: z.string(),
});

/**
 * Song with animals image prompt schema
 */
export const SongWithAnimalsImagePromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    prompt: z.string(),
});

/**
 * Song with animals video prompt schema
 */
export const SongWithAnimalsVideoPromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    video_prompt: z.string(),
});

/**
 * Song with animals group frame prompt schema
 */
export const SongWithAnimalsGroupFramePromptSchema = z.object({
    index: z.number(),
    lines: z.array(z.string()),
    group_image_prompt: z.string(),
    group_video_prompt: z.string(),
});

/**
 * Song with animals output schema
 */
export const SongWithAnimalsOutputSchema = z.object({
    prompts: z.array(SongWithAnimalsImagePromptSchema),
    video_prompts: z.array(SongWithAnimalsVideoPromptSchema),
    titles: z.array(z.string()),
    group_frames: z.array(SongWithAnimalsGroupFramePromptSchema).optional(),
    requests: z.array(LLMRequestSchema).optional(),
});

/**
 * Halloween Patchwork input item schema
 */
export const HalloweenPatchworkInputItemSchema = z.object({
    lyrics: z.string(),
});

/**
 * Halloween Patchwork image prompt schema
 */
export const HalloweenPatchworkImagePromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    prompt: z.string(),
});

/**
 * Halloween Patchwork video prompt schema
 */
export const HalloweenPatchworkVideoPromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    video_prompt: z.string(),
});

/**
 * Halloween Patchwork group frame prompt schema
 */
export const HalloweenPatchworkGroupFramePromptSchema = z.object({
    index: z.number(),
    lines: z.array(z.string()),
    group_image_prompt: z.string(),
    group_video_prompt: z.string(),
});

/**
 * Halloween Patchwork output schema
 */
export const HalloweenPatchworkOutputSchema = z.object({
    prompts: z.array(HalloweenPatchworkImagePromptSchema),
    video_prompts: z.array(HalloweenPatchworkVideoPromptSchema),
    titles: z.array(z.string()),
    group_frames: z.array(HalloweenPatchworkGroupFramePromptSchema).optional(),
    requests: z.array(LLMRequestSchema).optional(),
});

/**
 * Short study input item schema (deprecated)
 */
export const ShortStudyInputItemSchema = z.object({
    topic: z.string(),
});

/**
 * Short study image prompt schema (deprecated)
 */
export const ShortStudyImagePromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    prompt: z.string(),
});

/**
 * Short study video prompt schema (deprecated)
 */
export const ShortStudyVideoPromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    video_prompt: z.string(),
});

/**
 * Short study song prompt schema (deprecated)
 */
export const ShortStudySongPromptSchema = z.object({
    song_text: z.string(),
    music_prompt: z.string(),
});

/**
 * Short study output schema (deprecated)
 */
export const ShortStudyOutputSchema = z.object({
    song: ShortStudySongPromptSchema.nullable(),
    video_prompt: ShortStudyVideoPromptSchema,
    title: z.string(),
    description: z.string(),
    hashtags: z.string(),
    requests: z.array(LLMRequestSchema).optional(),
});

/**
 * Halloween input item schema
 */
export const HalloweenInputItemSchema = z.object({
    lyrics: z.string(),
});

/**
 * Halloween image prompt schema
 */
export const HalloweenImagePromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    prompt: z.string(),
});

/**
 * Halloween video prompt schema
 */
export const HalloweenVideoPromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    video_prompt: z.string(),
});

/**
 * Halloween group frame prompt schema
 */
export const HalloweenGroupFramePromptSchema = z.object({
    index: z.number(),
    lines: z.array(z.string()),
    group_image_prompt: z.string(),
    group_video_prompt: z.string(),
});

/**
 * Halloween output schema
 */
export const HalloweenOutputSchema = z.object({
    prompts: z.array(HalloweenImagePromptSchema),
    video_prompts: z.array(HalloweenVideoPromptSchema),
    titles: z.array(z.string()),
    group_frames: z.array(HalloweenGroupFramePromptSchema).optional(),
    requests: z.array(LLMRequestSchema).optional(),
});

/**
 * Halloween Transform video prompt schema
 */
export const HalloweenTransformVideoPromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    prompt: z.string(), // Starting image prompt (friendly, neutral form)
    video_prompt: z.string(), // Transformation video prompt (6-second creative transformation)
});

/**
 * Halloween Transform output schema
 */
export const HalloweenTransformOutputSchema = z.object({
    prompts: z.array(HalloweenImagePromptSchema),
    video_prompts: z.array(HalloweenTransformVideoPromptSchema),
    titles: z.array(z.string()),
    group_frames: z.array(HalloweenGroupFramePromptSchema).optional(),
    requests: z.array(LLMRequestSchema).optional(),
});

/**
 * Poems input item schema
 */
export const PoemsInputItemSchema = z.object({
    lyrics: z.string(),
});

/**
 * Poems image prompt schema
 */
export const PoemsImagePromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    prompt: z.string(),
});

/**
 * Poems video prompt schema
 */
export const PoemsVideoPromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    video_prompt: z.string(),
});

/**
 * Poems group frame prompt schema
 */
export const PoemsGroupFramePromptSchema = z.object({
    index: z.number(),
    lines: z.array(z.string()),
    group_image_prompt: z.string(),
    group_video_prompt: z.string(),
});

/**
 * Poems output schema
 */
export const PoemsOutputSchema = z.object({
    prompts: z.array(PoemsImagePromptSchema),
    video_prompts: z.array(PoemsVideoPromptSchema),
    titles: z.array(z.string()),
    group_frames: z.array(PoemsGroupFramePromptSchema).optional(),
    requests: z.array(LLMRequestSchema).optional(),
});

/**
 * Poems Direct Video input item schema
 */
export const PoemsDirectVideoInputItemSchema = z.object({
    lyrics: z.string(),
});

/**
 * Poems Direct Video video prompt schema
 */
export const PoemsDirectVideoVideoPromptSchema = z.object({
    index: z.number(),
    line: z.string(),
    video_prompt: z.string(),
});

/**
 * Poems Direct Video group frame prompt schema
 */
export const PoemsDirectVideoGroupFramePromptSchema = z.object({
    index: z.number(),
    lines: z.array(z.string()),
    group_image_prompt: z.string(),
    group_video_prompt: z.string(),
});

/**
 * Poems Direct Video output schema
 */
export const PoemsDirectVideoOutputSchema = z.object({
    video_prompts: z.array(PoemsDirectVideoVideoPromptSchema),
    titles: z.array(z.string()),
    group_frames: z.array(PoemsDirectVideoGroupFramePromptSchema).optional(),
    requests: z.array(LLMRequestSchema).optional(),
});

// ============================================================================
// Type exports (inferred from schemas)
// ============================================================================

/**
 * LLM request tracking information type (inferred from schema)
 */
export type LLMRequest = z.infer<typeof LLMRequestSchema>;

/**
 * Script component type (inferred from schema)
 */
export type Script = z.infer<typeof ScriptSchema>;

/**
 * Character component type (inferred from schema)
 */
export type Character = z.infer<typeof CharacterSchema>;

/**
 * Media prompt component type (inferred from schema)
 */
export type MediaPrompt = z.infer<typeof MediaPromptSchema>;

/**
 * Enhanced media prompt component type (inferred from schema)
 */
export type EnhancedMediaPrompt = z.infer<typeof EnhancedMediaPromptSchema>;

/**
 * Music suggestion component type (inferred from schema)
 */
export type MusicSuggestion = z.infer<typeof MusicSuggestionSchema>;

/**
 * Title and description component type (inferred from schema)
 */
export type TitleDescription = z.infer<typeof TitleDescriptionSchema>;

/**
 * Complete content package type (inferred from schema)
 */
export type ContentPackage = z.infer<typeof ContentPackageSchema>;

/**
 * Pipeline options
 * Note: This remains an interface because it contains function types that cannot be expressed in Zod
 */
export interface PipelineOptions {
    channelName?: string;
    requestId?: string;
    emitLog?: (log: string, requestId: string | undefined) => void;
    style?: string; // Visual style for song with animals pipeline
    generateGroupFrames?: boolean; // Flag to generate group frames
    linesPerVideo?: number; // Number of song lines to combine into one video
}

/**
 * Song with animals input item type (inferred from schema)
 */
export type SongWithAnimalsInputItem = z.infer<typeof SongWithAnimalsInputItemSchema>;

/**
 * Song with animals input type
 */
export type SongWithAnimalsInput = SongWithAnimalsInputItem[];

/**
 * Song with animals image prompt type (inferred from schema)
 */
export type SongWithAnimalsImagePrompt = z.infer<typeof SongWithAnimalsImagePromptSchema>;

/**
 * Song with animals video prompt type (inferred from schema)
 */
export type SongWithAnimalsVideoPrompt = z.infer<typeof SongWithAnimalsVideoPromptSchema>;

/**
 * Song with animals group frame prompt type (inferred from schema)
 */
export type SongWithAnimalsGroupFramePrompt = z.infer<typeof SongWithAnimalsGroupFramePromptSchema>;

/**
 * Song with animals output type (inferred from schema)
 */
export type SongWithAnimalsOutput = z.infer<typeof SongWithAnimalsOutputSchema>;

/**
 * Halloween Patchwork input item type (inferred from schema)
 */
export type HalloweenPatchworkInputItem = z.infer<typeof HalloweenPatchworkInputItemSchema>;

/**
 * Halloween Patchwork input type
 */
export type HalloweenPatchworkInput = HalloweenPatchworkInputItem[];

/**
 * Halloween Patchwork image prompt type (inferred from schema)
 */
export type HalloweenPatchworkImagePrompt = z.infer<typeof HalloweenPatchworkImagePromptSchema>;

/**
 * Halloween Patchwork video prompt type (inferred from schema)
 */
export type HalloweenPatchworkVideoPrompt = z.infer<typeof HalloweenPatchworkVideoPromptSchema>;

/**
 * Halloween Patchwork group frame prompt type (inferred from schema)
 */
export type HalloweenPatchworkGroupFramePrompt = z.infer<typeof HalloweenPatchworkGroupFramePromptSchema>;

/**
 * Halloween Patchwork output type (inferred from schema)
 */
export type HalloweenPatchworkOutput = z.infer<typeof HalloweenPatchworkOutputSchema>;

/**
 * Short study input item type (inferred from schema, deprecated)
 */
export type ShortStudyInputItem = z.infer<typeof ShortStudyInputItemSchema>;

/**
 * Short study input type (deprecated)
 */
export type ShortStudyInput = ShortStudyInputItem[];

/**
 * Short study image prompt type (inferred from schema, deprecated)
 */
export type ShortStudyImagePrompt = z.infer<typeof ShortStudyImagePromptSchema>;

/**
 * Short study video prompt type (inferred from schema, deprecated)
 */
export type ShortStudyVideoPrompt = z.infer<typeof ShortStudyVideoPromptSchema>;

/**
 * Short study song prompt type (inferred from schema, deprecated)
 */
export type ShortStudySongPrompt = z.infer<typeof ShortStudySongPromptSchema>;

/**
 * Short study output type (inferred from schema, deprecated)
 */
export type ShortStudyOutput = z.infer<typeof ShortStudyOutputSchema>;

/**
 * Halloween input item type (inferred from schema)
 */
export type HalloweenInputItem = z.infer<typeof HalloweenInputItemSchema>;

/**
 * Halloween input type
 */
export type HalloweenInput = HalloweenInputItem[];

/**
 * Halloween image prompt type (inferred from schema)
 */
export type HalloweenImagePrompt = z.infer<typeof HalloweenImagePromptSchema>;

/**
 * Halloween video prompt type (inferred from schema)
 */
export type HalloweenVideoPrompt = z.infer<typeof HalloweenVideoPromptSchema>;

/**
 * Halloween group frame prompt type (inferred from schema)
 */
export type HalloweenGroupFramePrompt = z.infer<typeof HalloweenGroupFramePromptSchema>;

/**
 * Halloween output type (inferred from schema)
 */
export type HalloweenOutput = z.infer<typeof HalloweenOutputSchema>;

/**
 * Halloween Transform video prompt type (inferred from schema)
 */
export type HalloweenTransformVideoPrompt = z.infer<typeof HalloweenTransformVideoPromptSchema>;

/**
 * Halloween Transform output type (inferred from schema)
 */
export type HalloweenTransformOutput = z.infer<typeof HalloweenTransformOutputSchema>;

/**
 * Poems input item type (inferred from schema)
 */
export type PoemsInputItem = z.infer<typeof PoemsInputItemSchema>;

/**
 * Poems input type
 */
export type PoemsInput = PoemsInputItem[];

/**
 * Poems image prompt type (inferred from schema)
 */
export type PoemsImagePrompt = z.infer<typeof PoemsImagePromptSchema>;

/**
 * Poems video prompt type (inferred from schema)
 */
export type PoemsVideoPrompt = z.infer<typeof PoemsVideoPromptSchema>;

/**
 * Poems group frame prompt type (inferred from schema)
 */
export type PoemsGroupFramePrompt = z.infer<typeof PoemsGroupFramePromptSchema>;

/**
 * Poems output type (inferred from schema)
 */
export type PoemsOutput = z.infer<typeof PoemsOutputSchema>;

/**
 * Poems Direct Video input item type (inferred from schema)
 */
export type PoemsDirectVideoInputItem = z.infer<typeof PoemsDirectVideoInputItemSchema>;

/**
 * Poems Direct Video input type
 */
export type PoemsDirectVideoInput = PoemsDirectVideoInputItem[];

/**
 * Poems Direct Video video prompt type (inferred from schema)
 */
export type PoemsDirectVideoVideoPrompt = z.infer<typeof PoemsDirectVideoVideoPromptSchema>;

/**
 * Poems Direct Video group frame prompt type (inferred from schema)
 */
export type PoemsDirectVideoGroupFramePrompt = z.infer<typeof PoemsDirectVideoGroupFramePromptSchema>;

/**
 * Poems Direct Video output type (inferred from schema)
 */
export type PoemsDirectVideoOutput = z.infer<typeof PoemsDirectVideoOutputSchema>;

/* END GENAI */
