/* START GENAI */
/**
 * fal.ai LangChain Adapter
 * Provides a LangChain-compatible interface for fal.ai LLM
 */

import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage, AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import { ChatGenerationChunk } from '@langchain/core/outputs';

import { createFalLLM } from './falLlmService.js';
import { LLMOptions } from '../types/config.js';
import { FalLLM, FalLLMResponse } from '../types/llm.js';

/**
 * LangChain adapter for fal.ai LLM
 */
export class FalChatModel extends BaseChatModel {
    private falLLM: FalLLM;
    private lastRequestId: string | undefined;

    constructor(options: LLMOptions = {}) {
        super({});
        this.falLLM = createFalLLM(options);
        this.lastRequestId = undefined;
    }

    /**
     * Get the last request ID from the most recent LLM call
     */
    getLastRequestId(): string | undefined {
        return this.lastRequestId;
    }

    _llmType(): string {
        return "fal-chat";
    }

    _modelType(): string {
        return "fal-chat";
    }

    async _generate(
        messages: BaseMessage[],
        options?: this["ParsedCallOptions"],
        runManager?: CallbackManagerForLLMRun
    ): Promise<{
        generations: Array<{
            text: string;
            message: AIMessage;
        }>;
    }> {
        // Extract system message
        const systemMessage = messages.find((m) => m._getType() === 'system') as SystemMessage | undefined;
        const systemPrompt = systemMessage?.text;

        // Extract human messages
        const humanMessages = messages.filter((m) => m._getType() === 'human') as HumanMessage[];
        const prompt = humanMessages.map((m) => m.text).join('\n');

        if (!prompt) {
            throw new Error("No human message found in the messages array");
        }

        // Call fal.ai LLM
        const response: FalLLMResponse = await this.falLLM.call(prompt, systemPrompt);
        
        // Store requestId for tracking
        if (response.requestId) {
            this.lastRequestId = response.requestId;
        }

        return {
            generations: [{
                text: response.text,
                message: new AIMessage(response.text),
            }],
        };
    }

    /** @ignore */
    async *_streamResponseChunks(
        messages: BaseMessage[],
        options: this["ParsedCallOptions"],
        runManager?: CallbackManagerForLLMRun
    ): AsyncGenerator<ChatGenerationChunk> {
        // fal.ai doesn't support streaming yet, so return full response as one chunk
        const response = await this._generate(messages, options, runManager);
        const gen = response.generations[0];
        if (!gen) {
            throw new Error('No generations returned from fal.ai LLM');
        }
        const dummyMessage = {
            text: gen.text,
            concat: (chunk: any) => dummyMessage
        };
        yield new ChatGenerationChunk({
            text: gen.text,
            message: dummyMessage as any
        });
    }
}

/* END GENAI */