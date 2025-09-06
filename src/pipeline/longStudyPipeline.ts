/* START GENAI */
/**
 * Content Pipeline
 * Implements the main content generation pipeline using FAL.AI async queue
 */
import { runContentPipelineAsync } from './longStudyPipelineAsync.js';
import { ContentPackage, PipelineOptions } from '../types/pipeline.js';

/**
 * Run the complete content generation pipeline using FAL.AI async queue
 * @param topics - The topics for the video
 * @param options - Options for the pipeline
 * @returns The complete generated content or null on failure
 */
async function runContentPipeline(
    topics: Record<string, string[]>,
    options: PipelineOptions = {}
): Promise<Record<string, Record<string, ContentPackage | null>>> {
    console.log('🚀 Starting async content generation pipeline with FAL.AI queue...');
    return await runContentPipelineAsync(topics, options);
}

export { runContentPipeline };
/* END GENAI */