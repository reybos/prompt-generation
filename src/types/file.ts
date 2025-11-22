/* START GENAI */
/**
 * File system utility schemas and type definitions
 * Using string type instead of BufferEncoding to avoid Node.js type issues
 */

import { z } from 'zod';

/**
 * Number tracker state schema
 */
export const NumberTrackerStateSchema = z.object({
    lastNumber: z.number().int().nonnegative(),
});

/**
 * File content schema
 */
export const FileContentSchema = z.object({
    content: z.string().optional(),
    originalTopic: z.string(),
    theme: z.string(),
}).catchall(z.unknown());

/**
 * Generation file info schema
 */
export const GenerationFileInfoSchema = z.object({
    filename: z.string(),
    number: z.number().int().nonnegative(),
    theme: z.string(),
    topic: z.string(),
    path: z.string(),
    size: z.number().nonnegative(),
    created: z.string().datetime(),
});

/**
 * Generation metadata schema
 */
export const GenerationMetadataSchema = z.object({
    theme: z.string(),
    originalTheme: z.string(),
    topic: z.string(),
    originalTopic: z.string(),
    filename: z.string(),
    path: z.string(),
    number: z.number().int().nonnegative(),
    timestamp: z.string().datetime(),
});

/**
 * Number tracker state type (inferred from schema)
 */
export type NumberTrackerState = z.infer<typeof NumberTrackerStateSchema>;

/**
 * File content type (inferred from schema)
 */
export type FileContent = z.infer<typeof FileContentSchema>;

/**
 * Generation file info type (inferred from schema)
 */
export type GenerationFileInfo = z.infer<typeof GenerationFileInfoSchema>;

/**
 * Generation metadata type (inferred from schema)
 */
export type GenerationMetadata = z.infer<typeof GenerationMetadataSchema>;

/* END GENAI */