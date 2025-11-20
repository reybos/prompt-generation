/* START GENAI */
/**
 * LLM service type definitions
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { Runnable } from '@langchain/core/runnables';
import { ChainValues } from '@langchain/core/utils/types';
import { LLMOptions } from './config.js';

/**
 * fal.ai LLM response
 */
export interface FalLLMResponse {
    text: string;
    reasoning?: string;
    requestId?: string;
    [key: string]: any;
}

/**
 * fal.ai LLM interface
 */
export interface FalLLM {
    call: (prompt: string, systemPrompt?: string) => Promise<FalLLMResponse>;
}

/**
 * Queue status type
 */
export type QueueStatusType =
    | 'QUEUED'
    | 'IN_QUEUE'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'FAILED';

/**
 * Queue log entry
 */
export interface QueueLog {
    message: string;
    level?: string;
    timestamp?: string;
}

/**
 * Queue status
 */
export interface QueueStatus {
    status: QueueStatusType;
    position?: number;
    logs?: QueueLog[];
    error?: string;
    [key: string]: any;
}

/**
 * Chain parameters
 */
export type ChainParameters = Record<string, any>;


/**
 * Chain factory function
 */
export type ChainFactory = (
    promptTemplate: PromptTemplate,
    options?: LLMOptions,
    outputKey?: string
) => Runnable<ChainValues, string>;


/* END GENAI */