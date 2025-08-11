/* START GENAI */
/**
 * Configuration type definitions
 */

/**
 * Output format options
 */
export enum OutputFormat {
    JSON = 'json',
    YAML = 'yaml',
    TEXT = 'text'
}

/**
 * LLM options for creating a language model
 */
export interface LLMOptions {
    model?: string;
    temperature?: number;
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
    defaultTemperature: number;
    defaultChannelName: string;
    defaultTopic: string;
    generationsDirPath?: string;
    generationsDirRelativePath?: string;
    
    // Song segmentation configuration
    songSegmentLines: number;

    // fal.ai configuration
    falApiKey: string | undefined;
    falDefaultModel: string;
    useFalApi: boolean;
}

/**
 * Application configuration
 */
export interface AppConfig extends EnvironmentConfig {
    outputFormats: {
        json: OutputFormat.JSON;
        yaml: OutputFormat.YAML;
        text: OutputFormat.TEXT;
    };
}
/* END GENAI */