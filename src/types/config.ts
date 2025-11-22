/* START GENAI */
/**
 * Configuration schemas and type definitions
 */

import { z } from 'zod';

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
 * Environment configuration schema
 */
export const EnvironmentConfigSchema = z.object({
    defaultTemperature: z.number().min(0).max(2),
    defaultChannelName: z.string(),
    defaultTopic: z.string(),
    generationsDirPath: z.string().optional(),
    generationsDirRelativePath: z.string().optional(),
    // Song segmentation configuration
    songSegmentLines: z.number().int().min(1).max(10),
    // fal.ai configuration
    falApiKey: z.string().optional(),
    falDefaultModel: z.string(),
    useFalApi: z.boolean(),
});

/**
 * Environment configuration type (inferred from schema)
 */
export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>;

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