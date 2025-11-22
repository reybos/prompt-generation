/* START GENAI */
/**
 * File system utilities for managing saved generations
 */

/// <reference types="node" />

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { getGenerationsDir } from '../config/index.js';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get __dirname equivalent for ES modules
 * Use this in any file that needs to access the current directory
 */
export function getDirname(importMetaUrl: string): string {
    const filename = fileURLToPath(importMetaUrl);
    return path.dirname(filename);
}

// Calculate project root (where package.json is located)
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Remove old GENERATIONS_DIR logic and use getGenerationsDir()
const GENERATIONS_DIR: string | null = getGenerationsDir();

/**
 * Helper to get and increment the file number for generations
 */
export async function getNextFileNumber(generationsDir: string): Promise<number> {
  const trackerPath = path.join(generationsDir, 'number_tracker.json');
  let number = 1;
  try {
    const data = await fs.readFile(trackerPath, 'utf-8');
    const obj = JSON.parse(data);
    if (typeof obj.number === 'number') number = obj.number;
  } catch (e) {
    // If file doesn't exist, start from 1
  }
  // Save incremented number
  await fs.writeFile(trackerPath, JSON.stringify({ number: number + 1 }), 'utf-8');
  return number;
}