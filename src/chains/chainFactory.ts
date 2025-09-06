/* START GENAI */
/**
 * Chain Factory
 * Creates LangChain chains with configured LLM and prompts
 * Supports both sync and async queue-based processing
 */
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, Runnable } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { FalChatModel } from '../services/falLangChainAdapter.js';
import { LLMOptions } from '../types/config.js';
import { ChainFactory } from '../types/llm.js';
import { submitToQueueWithTracking } from '../services/falQueueService.js';

/**
 * Create a LangChain chain with the given prompt template using LCEL
 * @param promptTemplate - The prompt template to use
 * @param options - Options for the LLM
 * @param outputKey - The key to use for the output (default: 'text')
 * @returns The configured LCEL chain
 */
const createChain: ChainFactory = (
    promptTemplate: PromptTemplate,
    options: LLMOptions = {},
    outputKey: string = 'text'
): Runnable<any, string> => {
    // Always use FalChatModel
    const llm = new FalChatModel(options);

    // Compose the chain using the modern pipe style
    return promptTemplate.pipe(llm).pipe(new StringOutputParser());
};

/**
 * Create an async chain that submits to FAL.AI queue
 * @param promptTemplate - The prompt template to use
 * @param options - Options for the LLM
 * @param stepName - Name of the pipeline step
 * @param topic - Topic being processed
 * @returns Function that submits to queue and returns request ID
 */
const createAsyncChain = (
    promptTemplate: PromptTemplate,
    options: LLMOptions = {},
    stepName: string,
    topic: string
) => {
    return async (params: Record<string, any>): Promise<string> => {
        // Format the prompt with parameters
        const formattedPrompt = await promptTemplate.format(params);
        
        // Submit to queue with tracking
        const requestId = await submitToQueueWithTracking(
            formattedPrompt,
            undefined, // system prompt
            stepName,
            topic,
            {
                model: options.model,
                temperature: options.temperature
            }
        );
        
        return requestId;
    };
};

export {
    createChain,
    createAsyncChain,
};
/* END GENAI */