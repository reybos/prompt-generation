/* START GENAI */
/**
 * Pipeline utility functions
 */

import { Runnable } from '@langchain/core/runnables';
import { ChainValues } from '@langchain/core/utils/types';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { ChainParameters, PipelineStepFunction } from '../types/llm.js';
import { safeJsonParse } from './jsonParser.js';
import { LLMRequest } from '../types/pipeline.js';
import { FalChatModel } from '../services/falLangChainAdapter.js';
import { LLMOptions } from '../types/config.js';

/**
 * Execute a pipeline step with standardized logging and error handling
 * @param stepName - Name of the pipeline step (e.g., "SCRIPT", "CHARACTER")
 * @param chain - The LCEL chain to execute
 * @param params - Parameters to pass to the chain
 * @param parseJson - Whether to parse the result as JSON (default: true)
 * @param contextName - Optional context name for JSON parsing errors
 * @returns The result of the pipeline step (parsed JSON or raw string)
 */
export const executePipelineStep: PipelineStepFunction = async function <T = Record<string, any>>(
    stepName: string,
    chain: Runnable<ChainValues, string>,
    params: ChainParameters,
    parseJson: boolean = true,
    contextName: string | null = null
): Promise<T | string | null> {
    console.log(`\n--- GENERATING ${stepName} ---`);
    const text: string = await chain.invoke(params);
    console.log(`${stepName} response:`, text);

    if (parseJson) {
        const parsedResult: T | null = safeJsonParse<T>(text, contextName || stepName.toLowerCase());
        if (!parsedResult) return null;

        console.log(`\n--- ${stepName} GENERATED ---`);
        console.dir(parsedResult, { depth: null });
        return parsedResult;
    } else {
        console.log(`\n--- ${stepName} GENERATED ---`);
        console.log(text);
        return text;
    }
};

/**
 * Execute a pipeline step with request tracking
 * @param stepName - Name of the pipeline step
 * @param promptTemplate - The prompt template to use
 * @param options - Options for the LLM (model, temperature)
 * @param params - Parameters to pass to the chain
 * @param requests - Array to store request tracking information
 * @param parseJson - Whether to parse the result as JSON (default: true)
 * @param contextName - Optional context name for JSON parsing errors
 * @returns The result of the pipeline step (parsed JSON or raw string)
 */
export async function executePipelineStepWithTracking<T = Record<string, any>>(
    stepName: string,
    promptTemplate: PromptTemplate,
    options: LLMOptions,
    params: ChainParameters,
    requests: LLMRequest[],
    parseJson: boolean = true,
    contextName: string | null = null
): Promise<T | string | null> {
    // Format the prompt
    const formattedPrompt = await promptTemplate.format(params);
    
    // Create LLM instance (we need to keep reference to get requestId later)
    const llm = new FalChatModel(options);
    
    // Create chain
    const chain = promptTemplate.pipe(llm).pipe(new StringOutputParser());
    
    // Execute the step
    console.log(`\n--- GENERATING ${stepName} ---`);
    const text: string = await chain.invoke(params);
    console.log(`${stepName} response:`, text);
    
    // Get requestId from LLM instance
    const requestId = llm.getLastRequestId();
    
    // Store request information
    const model = options.model || 'unknown';
    requests.push({
        prompt: formattedPrompt,
        model: model,
        requestId: requestId
    });
    
    // Parse and return result
    if (parseJson) {
        const parsedResult: T | null = safeJsonParse<T>(text, contextName || stepName.toLowerCase());
        if (!parsedResult) return null;

        console.log(`\n--- ${stepName} GENERATED ---`);
        console.dir(parsedResult, { depth: null });
        return parsedResult;
    } else {
        console.log(`\n--- ${stepName} GENERATED ---`);
        console.log(text);
        return text;
    }
}

/* END GENAI */