/* START GENAI */
/**
 * Pipeline utility functions
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { ChainParameters } from '../types/llm.js';
import { safeJsonParse } from './jsonParser.js';
import { LLMRequest } from '../types/pipeline.js';
import { FalChatModel } from '../services/falLangChainAdapter.js';
import { LLMOptions } from '../types/config.js';
import { extractSystemPrompt } from './promptUtils.js';

/**
 * Options for executePipelineStepWithTracking
 */
export interface ExecutePipelineStepOptions {
    /** Name of the pipeline step */
    stepName: string;
    /** The prompt template to use */
    promptTemplate: PromptTemplate;
    /** Options for the LLM (model, temperature) */
    options: LLMOptions;
    /** Parameters to pass to the chain */
    params: ChainParameters;
    /** Array to store request tracking information */
    requests: LLMRequest[];
    /** Whether to parse the result as JSON (default: true) */
    parseJson?: boolean;
    /** Optional context name for JSON parsing errors (defaults to stepName.toLowerCase()) */
    contextName?: string;
}

/**
 * Execute a pipeline step with request tracking
 * @param opts - Options object containing all parameters
 * @returns The result of the pipeline step (parsed JSON or raw string)
 */
export async function executePipelineStepWithTracking<T = Record<string, any>>(
    opts: ExecutePipelineStepOptions
): Promise<T | string | null> {
    // Validate required parameters
    if (!opts.stepName || !opts.promptTemplate || !opts.params || !opts.requests) {
        throw new Error('Missing required parameters: stepName, promptTemplate, params, and requests are required');
    }

    const {
        stepName,
        promptTemplate,
        options,
        params,
        requests,
        parseJson = true,
        contextName = stepName.toLowerCase()
    } = opts;

    try {
        // Extract system prompt using utility function
        const systemPrompt = extractSystemPrompt(promptTemplate);
        
        // Format the prompt with parameters (needed for tracking)
        // Note: chain.invoke() will format again internally, but we need this for tracking
        const formattedPrompt = await promptTemplate.format(params);
        
        // Create LLM instance (we need to keep reference to get requestId later)
        // Note: We create a new instance each time because each FalChatModel stores its own
        // lastRequestId state. Reusing instances would cause requestId conflicts.
        // This is not a performance issue as object creation is fast compared to API calls.
        const llm = new FalChatModel(options);
        
        // Create chain
        const chain = promptTemplate.pipe(llm).pipe(new StringOutputParser());
        
        // Execute the step
        console.log(`\n--- GENERATING ${stepName} ---`);
        let text: string;
        try {
            text = await chain.invoke(params);
            console.log(`${stepName} response:`, text);
        } catch (error) {
            console.error(`Error executing chain for ${stepName}:`, error);
            throw new Error(`Failed to execute pipeline step "${stepName}": ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Get requestId from LLM instance
        const requestId = llm.getLastRequestId();
        
        // Store request information
        const model = options.model || 'unknown';
        requests.push({
            prompt: formattedPrompt, // Formatted prompt with inserted data
            systemPrompt: systemPrompt, // Template/instructions before data insertion
            params: params, // Parameters that were inserted into placeholders
            model: model,
            requestId: requestId
        });
        
        // Parse and return result
        if (parseJson) {
            const parsedResult: T | null = safeJsonParse<T>(text, contextName);
            if (!parsedResult) {
                console.error(`Failed to parse JSON for ${stepName} (context: ${contextName})`);
                return null;
            }

            console.log(`\n--- ${stepName} GENERATED ---`);
            console.dir(parsedResult, { depth: null });
            return parsedResult;
        } else {
            console.log(`\n--- ${stepName} GENERATED ---`);
            console.log(text);
            return text;
        }
    } catch (error) {
        console.error(`Error in executePipelineStepWithTracking for ${stepName}:`, error);
        throw error;
    }
}


/* END GENAI */