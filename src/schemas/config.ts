/* START GENAI */
/**
 * Configuration schemas and types
 */

import { z } from 'zod';

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

/* END GENAI */