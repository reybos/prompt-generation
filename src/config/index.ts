/* START GENAI */
/**
 * Configuration module
 * Exports all configuration settings
 */
import environmentConfig from './environment.js';
import { OutputFormat, AppConfig } from '../types/config.js';
import path from 'path';

/**
 * Output format options
 */
const outputFormats: { json: OutputFormat.JSON; yaml: OutputFormat.YAML; text: OutputFormat.TEXT } = {
    json: OutputFormat.JSON,
    yaml: OutputFormat.YAML,
    text: OutputFormat.TEXT,
};

/**
 * Complete application configuration
 */
const config: AppConfig = {
    ...environmentConfig,
    outputFormats,
};

/**
 * Utility to resolve the generations directory
 */
export function getGenerationsDir() {
    if (config.generationsDirPath) {
        return config.generationsDirPath;
    } else if (config.generationsDirRelativePath) {
        return path.resolve(process.cwd(), config.generationsDirRelativePath);
    }
    return null;
}

export default config;
/* END GENAI */