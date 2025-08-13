/* START GENAI */
/**
 * Pipeline type definitions
 */

/**
 * Script component structure
 */
export interface Script {
    introduction: {
        title: string;
        description: string;
        narration: string;
    };
    scenes: Array<{
        title: string;
        description: string;
        narration: string;
        visuals: string;
        interaction?: string;
    }>;
    finale: {
        summary: string;
        narration: string;
        callToAction?: string;
    };
}

/**
 * Character component structure
 */
export interface Character {
    name: string;
    appearance: string;
    personality: string;
    gestures: string[];
    voiceDescription: string;
}

/**
 * Media prompt component structure
 */
export interface MediaPrompt {
    introduction: {
        description: string;
        prompt: string;
    };
    scenes: Array<{
        description: string;
        prompt: string;
    }>;
    finale: {
        description: string;
        prompt: string;
    };
}

/**
 * Enhanced media prompt component structure
 */
export interface EnhancedMediaPrompt {
    introduction: {
        description: string;
        prompt: string;
    };
    scenes: Array<{
        description: string;
        prompt: string;
    }>;
    finale: {
        description: string;
        prompt: string;
    };
    styleGuide: {
        visualStyle: string;
        colorPalette: string;
        characterConsistency: string;
    };
}

/**
 * Music suggestion component structure
 */
export interface MusicSuggestion {
    overallMood: string;
    recommendedTracks: Array<{
        title: string;
        description: string;
        mood: string;
        tempo: string;
        section?: string;
    }>;
}

/**
 * Title and description component structure
 */
export interface TitleDescription {
    title: string;
    shortDescription: string;
    longDescription: string;
    keywords: string[];
}

/**
 * Complete content package structure
 */
export interface ContentPackage {
    script: Script;
    media: MediaPrompt;
    enhancedMedia: EnhancedMediaPrompt;
    narration?: any;
    music: MusicSuggestion;
    titleDesc: TitleDescription;
    hashtags: string;
}

/**
 * Pipeline options
 */
export interface PipelineOptions {
    channelName?: string;
    requestId?: string;
    emitLog?: (log: string, requestId: string | undefined) => void;
    style?: string; // Visual style for song with animals pipeline
}

/* END GENAI */

/**
 * Song with animals input: array of song objects with lyrics
 */
export interface SongWithAnimalsInputItem {
    lyrics: string; // The song lyrics as a string
}

export type SongWithAnimalsInput = SongWithAnimalsInputItem[];

/**
 * Song with animals image prompt (output of image generation step)
 */
export interface SongWithAnimalsImagePrompt {
    index: number; // Scene index starting from 0 for easier identification
    line: string;
    prompt: string;
}

/**
 * Song with animals video prompt (output of video generation step)
 */
export interface SongWithAnimalsVideoPrompt {
    index: number; // Scene index starting from 0 for easier identification
    line: string;
    video_prompt: string;
}

/**
 * Song with animals output (final result)
 */
export interface SongWithAnimalsOutput {
    global_style: string;
    prompts: SongWithAnimalsImagePrompt[];
    video_prompts: SongWithAnimalsVideoPrompt[];
    titles: string[];
    descriptions: string[];
    hashtags: string[];
}

/**
 * Input for generating titles, descriptions and hashtags for existing video prompts
 */
export interface TitlesDescriptionsHashtagsInput {
    video_prompts: SongWithAnimalsVideoPrompt[];
    global_style: string;
}

/**
 * Output for generating titles, descriptions and hashtags
 */
export interface TitlesDescriptionsHashtagsOutput {
    titles: string[];
    descriptions: string[];
    hashtags: string[];
}

/**
 * Enhanced output with indices for titles, descriptions and hashtags
 */
export interface TitlesDescriptionsHashtagsOutputWithIndices {
    titles: Array<{ index: number; title: string }>;
    descriptions: Array<{ index: number; description: string }>;
    hashtags: Array<{ index: number; hashtags: string }>;
}