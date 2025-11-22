/* START GENAI */
/**
 * API schemas and type definitions
 */

import { z } from 'zod';
import { ContentPackage, ContentPackageSchema } from './pipeline.js';
import { GenerationMetadataSchema, GenerationMetadata } from './file.js';

/**
 * Generate content request schema
 */
export const GenerateContentRequestSchema = z.object({
    topics: z.record(z.string(), z.array(z.string())),
});

/**
 * Save generation request schema
 */
export const SaveGenerationRequestSchema = z.object({
    theme: z.string(),
    topic: z.string(),
    content: z.union([ContentPackageSchema, z.string()]), // ContentPackage or string
});

/**
 * Save generation response schema
 */
export const SaveGenerationResponseSchema = z.object({
    success: z.boolean(),
    savedFile: GenerationMetadataSchema,
});

/**
 * Generation info schema (used in listings)
 */
export const GenerationInfoSchema = z.object({
    filename: z.string(),
    topic: z.string(),
    path: z.string(),
    size: z.number(),
    created: z.string(),
});

/**
 * List generations response schema
 */
export const ListGenerationsResponseSchema = z.object({
    success: z.boolean(),
    generations: z.record(z.string(), z.array(GenerationInfoSchema)),
});

/**
 * Get generation content response schema
 */
export const GetGenerationContentResponseSchema = z.object({
    success: z.boolean(),
    content: z.string(),
});

/**
 * List themes response schema
 */
export const ListThemesResponseSchema = z.object({
    success: z.boolean(),
    themes: z.array(z.string()),
});

/**
 * Status response schema
 */
export const StatusResponseSchema = z.object({
    status: z.enum(['ok', 'error']),
});

/**
 * Generate content request type (inferred from schema)
 */
export type GenerateContentRequest = z.infer<typeof GenerateContentRequestSchema>;

/**
 * Generate content response
 */
export interface GenerateContentResponse {
    success: boolean;
    message: string;
    requestId: string;
}

/**
 * Save generation request type (inferred from schema)
 */
export type SaveGenerationRequest = z.infer<typeof SaveGenerationRequestSchema>;

/**
 * Save generation response type (inferred from schema)
 */
export type SaveGenerationResponse = z.infer<typeof SaveGenerationResponseSchema>;

/**
 * Generation info type (inferred from schema)
 */
export type GenerationInfo = z.infer<typeof GenerationInfoSchema>;

/**
 * List generations response type (inferred from schema)
 */
export type ListGenerationsResponse = z.infer<typeof ListGenerationsResponseSchema>;

/**
 * Get generation content response type (inferred from schema)
 */
export type GetGenerationContentResponse = z.infer<typeof GetGenerationContentResponseSchema>;

/**
 * List themes response type (inferred from schema)
 */
export type ListThemesResponse = z.infer<typeof ListThemesResponseSchema>;

/**
 * Status response type (inferred from schema)
 */
export type StatusResponse = z.infer<typeof StatusResponseSchema>;

/* END GENAI */