/* START GENAI */
/**
 * Prompt utility functions
 */

import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Extract system prompt from a PromptTemplate
 * Handles both string and MessageContent template types
 * @param promptTemplate - The prompt template to extract from
 * @returns The system prompt as a string
 */
export function extractSystemPrompt(promptTemplate: PromptTemplate): string {
    const templateValue = promptTemplate.template;
    return typeof templateValue === 'string' ? templateValue : JSON.stringify(templateValue);
}

/* END GENAI */

