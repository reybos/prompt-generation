/* START GENAI */
/**
 * Environment configuration module
 * Handles loading and validating environment variables
 */
import { z } from 'zod';
import type { EnvironmentConfig } from '../types/config.js';
import { EnvironmentConfigSchema } from '../types/config.js';

// Required environment variables
const requiredEnvVars: string[] = ['FAL_KEY'];

// Validate required environment variables
const missingEnvVars: string[] = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join('. ')}`);
    console.error('Please set these variables in your env file or environment');
}

// Log a warning if FAL_KEY is missing
if (!process.env.FAL_KEY) {
    console.warn('Warning: FAL_KEY is not set. Content generation will not work, but UI testing is possible.');
}

// Create environment configuration object
const environmentConfig: EnvironmentConfig = {
    // LLM configuration
    defaultTemperature: 0.6,

    // Application defaults
    defaultChannelName: 'Mini Marvels',
    defaultTopic: 'Colors of the Rainbow',

    // File storage configuration
    generationsDirPath: process.env.GENERATIONS_DIR_PATH,
    generationsDirRelativePath: process.env.GENERATIONS_DIR_RELATIVE_PATH,
    
    // Song segmentation configuration
    songSegmentLines: parseInt(process.env.SONG_SEGMENT_LINES || '3'),

    // fal.ai configuration
    falApiKey: process.env.FAL_KEY,
    falDefaultModel: process.env.FAL_DEFAULT_MODEL || 'anthropic/claude-3.7-sonnet',
    useFalApi: true, // Always use fal.ai
};

// Log generations directory configuration if provided
if (process.env.GENERATIONS_DIR_PATH) {
    console.log(`Using custom generations directory path: ${process.env.GENERATIONS_DIR_PATH}`);
} else if (process.env.GENERATIONS_DIR_RELATIVE_PATH) {
    console.log(`Using relative generations directory path: ${process.env.GENERATIONS_DIR_RELATIVE_PATH}`);
}

// Log song segmentation configuration
console.log(`Using song segmentation: ${environmentConfig.songSegmentLines} lines per segment`);

// Validate song segmentation value
if (environmentConfig.songSegmentLines < 1 || environmentConfig.songSegmentLines > 10) {
    console.warn(`Warning: SONG_SEGMENT_LINES value ${environmentConfig.songSegmentLines} is outside recommended range (1-10)`);
}

// Validate environment configuration
try {
    EnvironmentConfigSchema.parse(environmentConfig);
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error('Invalid environment configuration:', error.format());
        process.exit(1);
    }
    throw error;
}

export default environmentConfig;
/* END GENAI */