/* START GENAI */
/**
 * Common pipeline utility functions
 * Shared functions used across multiple pipelines
 */

import config from '../config/index.js';
import { PipelineOptions } from '../types/pipeline.js';
import fs from 'fs/promises';
import path from 'path';
import { getGenerationsDir } from '../config/index.js';
import { getNextFileNumber } from './fileUtils.js';

/**
 * Split lyrics into segments based on configuration
 * @param lyrics - Full song lyrics
 * @returns Array of segments with configured number of lines
 */
export function splitLyricsIntoSegments(lyrics: string): string[] {
  const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
  const segments: string[] = [];
  const segmentLines = config.songSegmentLines;
  
  for (let i = 0; i < lines.length; i += segmentLines) {
    const segment = lines.slice(i, i + segmentLines).join('\n');
    if (segment.trim()) {
      segments.push(segment);
    }
  }
  
  return segments;
}

/**
 * Group video prompts into segments based on configuration
 * @param video_prompts - Array of video prompts
 * @param segmentSize - Number of prompts per segment (defaults to config.songSegmentLines)
 * @returns Array of segments with configured number of video prompts
 */
export function groupVideoPromptsIntoSegments<T>(
  video_prompts: T[],
  segmentSize?: number
): T[][] {
  const segments: T[][] = [];
  const segmentLines = segmentSize || config.songSegmentLines;
  
  for (let i = 0; i < video_prompts.length; i += segmentLines) {
    const segment = video_prompts.slice(i, i + segmentLines);
    if (segment.length > 0) {
      segments.push(segment);
    }
  }
  
  return segments;
}

/**
 * Save pipeline result to file in unprocessed folder
 * @param result - The pipeline result to save
 * @param pipelineIdentifier - Pipeline identifier for the filename
 * @param options - Pipeline options for logging
 */
export async function savePipelineResult(
  result: any,
  pipelineIdentifier: string,
  options: PipelineOptions = {}
): Promise<void> {
  if (options.emitLog && options.requestId) {
    options.emitLog(`💾 Saving result...`, options.requestId);
  }
  
  const generationsDir = getGenerationsDir();
  if (generationsDir) {
    const unprocessedDir = path.join(generationsDir, 'unprocessed');
    await fs.mkdir(unprocessedDir, { recursive: true });
    const fileNumber = await getNextFileNumber(generationsDir);
    const filename = `${fileNumber}-${pipelineIdentifier}.json`;
    const filePath = path.join(unprocessedDir, filename);
    await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');
  }
}

/* END GENAI */

