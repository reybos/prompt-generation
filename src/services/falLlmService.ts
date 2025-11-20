/**
 * fal.ai LLM Service
 * Handles configuration and initialization of fal.ai language models
 */

import { LLMOptions } from '../types/config.js';
import { FalLLMResponse, FalLLM } from '../types/llm.js';
import { submitToQueue, pollForResult } from './falQueueService.js';
import config from '../config/index.js';

/**
 * Create a fal.ai LLM instance using queue-based approach
 * @param options - Configuration options
 * @returns Configured fal.ai LLM instance
 */
const createFalLLM = (options: LLMOptions = {}): FalLLM => {
    const model: string = options.model || config.falDefaultModel || 'anthropic/claude-3.7-sonnet';
    const temperature: number = options.temperature || config.defaultTemperature;

    return {
        call: async (prompt: string, systemPrompt?: string): Promise<FalLLMResponse> => {
            try {
                // Submit the prompt to the fal.ai queue
                const requestId: string = await submitToQueue(prompt, systemPrompt, {
                    model,
                    temperature,
                });

                console.log(`Request submitted to queue with ID: ${requestId}`);

                // Poll for the result from the queue
                const result: any = await pollForResult(requestId);

                // Safely access result data with fallback values
                const data = result?.data || result || {};
                
                return {
                    text: data.output || '',
                    reasoning: data.reasoning,
                    requestId: requestId,
                };
            } catch (error) {
                console.error('Error calling fal.ai LLM:', error);
                throw error;
            }
        },
    };
};

export { createFalLLM };