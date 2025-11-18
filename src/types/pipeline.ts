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
    requests?: LLMRequest[]; // Array of all LLM requests made during generation
}

/**
 * Pipeline options
 */
export interface PipelineOptions {
    channelName?: string;
    requestId?: string;
    emitLog?: (log: string, requestId: string | undefined) => void;
    style?: string; // Visual style for song with animals pipeline
    generateAdditionalFrames?: boolean; // Flag to generate additional frames
}

/**
 * LLM request tracking information
 */
export interface LLMRequest {
    prompt: string; // The formatted prompt that was sent to LLM (template with inserted params)
    systemPrompt: string; // The prompt template (instructions/rules before data insertion)
    params: Record<string, any>; // Parameters that were inserted into placeholders
    model: string; // The model version used
    requestId?: string; // Request ID if available
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
 * Song with animals additional frame prompt (group image)
 */
export interface SongWithAnimalsAdditionalFramePrompt {
    index: number; // Frame index starting from 0 for easier identification
    lines: string[]; // Array of 3 lines that were grouped together
    group_image_prompt: string; // Group image prompt for thumbnail
    group_video_prompt: string; // Group video prompt for animation
}

/**
 * Song with animals output (final result)
 */
export interface SongWithAnimalsOutput {
    global_style: string;
    prompts: SongWithAnimalsImagePrompt[];
    video_prompts: SongWithAnimalsVideoPrompt[];
    titles: string[];
    additional_frames?: SongWithAnimalsAdditionalFramePrompt[]; // Optional additional frames
    requests?: LLMRequest[]; // Array of all LLM requests made during generation
}

/**
 * Short study input: array of topic objects with description
 */
export interface ShortStudyInputItem {
    topic: string; // The study topic description as a string
}

export type ShortStudyInput = ShortStudyInputItem[];

/**
 * Short study image prompt (output of image generation step)
 */
export interface ShortStudyImagePrompt {
    index: number; // Scene index starting from 0 for easier identification
    line: string;
    prompt: string;
}

/**
 * Short study video prompt (output of video generation step)
 */
export interface ShortStudyVideoPrompt {
    index: number; // Scene index starting from 0 for easier identification
    line: string;
    video_prompt: string;
}

/**
 * Short study song prompt (output of song generation step)
 */
export interface ShortStudySongPrompt {
    song_text: string;
    music_prompt: string;
}

/**
 * Short study output (final result)
 */
export interface ShortStudyOutput {
    song: ShortStudySongPrompt | null;
    video_prompt: ShortStudyVideoPrompt;
    title: string;
    description: string;
    hashtags: string;
    requests?: LLMRequest[]; // Array of all LLM requests made during generation
}

/**
 * Halloween input: array of song objects with lyrics
 */
export interface HalloweenInputItem {
    lyrics: string; // The song lyrics as a string
}

export type HalloweenInput = HalloweenInputItem[];

/**
 * Halloween image prompt (output of image generation step)
 */
export interface HalloweenImagePrompt {
    index: number; // Scene index starting from 0 for easier identification
    line: string;
    prompt: string;
}

/**
 * Halloween video prompt (output of video generation step)
 */
export interface HalloweenVideoPrompt {
    index: number; // Scene index starting from 0 for easier identification
    line: string;
    video_prompt: string;
}

/**
 * Halloween additional frame prompt (group image)
 */
export interface HalloweenAdditionalFramePrompt {
    index: number; // Frame index starting from 0 for easier identification
    lines: string[]; // Array of 3 lines that were grouped together
    group_image_prompt: string; // Group image prompt for thumbnail
    group_video_prompt: string; // Group video prompt for animation
}

/**
 * Halloween output (final result)
 */
export interface HalloweenOutput {
    global_style: string;
    prompts: HalloweenImagePrompt[];
    video_prompts: HalloweenVideoPrompt[];
    titles: string[];
    additional_frames?: HalloweenAdditionalFramePrompt[]; // Optional additional frames
    requests?: LLMRequest[]; // Array of all LLM requests made during generation
}

/**
 * Halloween Transform video prompt (output of video generation step with transformation)
 */
export interface HalloweenTransformVideoPrompt {
    index: number; // Scene index starting from 0 for easier identification
    line: string;
    prompt: string; // Starting image prompt (friendly, neutral form)
    video_prompt: string; // Transformation video prompt (6-second creative transformation)
}

/**
 * Halloween Transform output (final result with transformation videos)
 */
export interface HalloweenTransformOutput {
    global_style: string;
    prompts: HalloweenImagePrompt[];
    video_prompts: HalloweenTransformVideoPrompt[];
    titles: string[];
    additional_frames?: HalloweenAdditionalFramePrompt[]; // Optional additional frames
    requests?: LLMRequest[]; // Array of all LLM requests made during generation
}

