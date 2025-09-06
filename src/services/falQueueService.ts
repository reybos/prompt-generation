/**
 * fal.ai Queue Service
 * Handles queue operations for fal.ai API with async support
 */

import { fal } from '@fal-ai/client';
import config from '../config/index.js';
import { QueueStatus, QueueLog } from '../types/llm.js';

// Interface for queued requests
interface QueuedRequest {
    requestId: string;
    stepName: string;
    topic: string;
    timestamp: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    result?: any;
    error?: string;
}

// In-memory storage for tracking requests (in production, use Redis or database)
const queuedRequests = new Map<string, QueuedRequest>();

/**
 * Submit a request to the fal.ai queue
 * @param prompt - The prompt to send
 * @param systemPrompt - Optional system prompt
 * @param options - Additional options
 * @returns The request ID
 */
const submitToQueue = async (
    prompt: string,
    systemPrompt?: string,
    options: Record<string, any> = {}
): Promise<string> => {
    if (!config.falApiKey) {
        throw new Error('FAL API key is not configured.');
    }

    const model = options.model || config.falDefaultModel || 'anthropic/claude-3.7-sonnet';
    const temperature = options.temperature || config.defaultTemperature;

    const { request_id } = await fal.queue.submit('fal-ai/any-llm', {
        input: {
            model,
            prompt,
            system_prompt: systemPrompt,
        },
        // webhookUrl: 'https://optional.webhook.url/for/results', // if needed
    });
    return request_id;
};

/**
 * Submit a request to the fal.ai queue with tracking
 * @param prompt - The prompt to send
 * @param systemPrompt - Optional system prompt
 * @param stepName - Name of the pipeline step
 * @param topic - Topic being processed
 * @param options - Additional options
 * @returns The request ID
 */
const submitToQueueWithTracking = async (
    prompt: string,
    systemPrompt: string | undefined,
    stepName: string,
    topic: string,
    options: Record<string, any> = {}
): Promise<string> => {
    const requestId = await submitToQueue(prompt, systemPrompt, options);
    
    // Track the request
    queuedRequests.set(requestId, {
        requestId,
        stepName,
        topic,
        timestamp: Date.now(),
        status: 'PENDING'
    });
    
    return requestId;
};

/**
 * Check the status of a queued request
 * @param requestId - The request ID
 * @returns The request status
 */
const checkQueueStatus = async (requestId: string): Promise<QueueStatus> => {
    if (!config.falApiKey) {
        throw new Error('FAL API key is not configured.');
    }

    const status = await fal.queue.status('fal-ai/any-llm', {
        requestId,
        logs: true,
    });
    return status as unknown as QueueStatus;
};

/**
 * Get the result of a completed request
 * @param requestId - The request ID
 * @returns The result
 */
const getQueueResult = async (requestId: string): Promise<any> => {
    if (!config.falApiKey) {
        throw new Error('FAL API key is not configured.');
    }

    return await fal.queue.result('fal-ai/any-llm', {
        requestId,
    });
};

/**
 * Poll for a result until it's ready
 * @param requestId - The request ID
 * @param maxAttempts - Maximum number of polling attempts
 * @param interval - Delay between polling attempts in ms
 * @returns The result
 */
const pollForResult = async (
    requestId: string,
    maxAttempts: number = 500,
    interval: number = 2000
): Promise<any> => {
    let attempts = 0;

    while (attempts < maxAttempts) {
        const status = await checkQueueStatus(requestId);

        if (status.status === 'COMPLETED') {
            return await getQueueResult(requestId);
        }

        if (status.status === 'FAILED') {
            throw new Error(`Request failed: ${status.error || 'Unknown error'}`);
        }

        if (status.logs && status.logs.length > 0) {
            status.logs.forEach((log: QueueLog) => {
                console.log(`[FAL LOG] ${log.message}`);
            });
        }

        attempts++;
        if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, interval));
        }
    }

    throw new Error(`Request timed out after ${maxAttempts} polling attempts`);
};

/**
 * Get all pending requests for a topic
 * @param topic - The topic to filter by
 * @returns Array of pending request IDs
 */
const getPendingRequestsForTopic = (topic: string): string[] => {
    const pendingRequests: string[] = [];
    for (const [requestId, request] of queuedRequests.entries()) {
        if (request.topic === topic && request.status === 'PENDING') {
            pendingRequests.push(requestId);
        }
    }
    return pendingRequests;
};

/**
 * Update request status
 * @param requestId - The request ID
 * @param status - New status
 * @param result - Optional result
 * @param error - Optional error message
 */
const updateRequestStatus = (
    requestId: string,
    status: QueuedRequest['status'],
    result?: any,
    error?: string
): void => {
    const request = queuedRequests.get(requestId);
    if (request) {
        request.status = status;
        if (result) request.result = result;
        if (error) request.error = error;
        queuedRequests.set(requestId, request);
    }
};

/**
 * Get request by ID
 * @param requestId - The request ID
 * @returns The request object or undefined
 */
const getRequest = (requestId: string): QueuedRequest | undefined => {
    return queuedRequests.get(requestId);
};

/**
 * Remove completed request from tracking
 * @param requestId - The request ID
 */
const removeRequest = (requestId: string): void => {
    queuedRequests.delete(requestId);
};

/**
 * Batch check status of multiple requests
 * @param requestIds - Array of request IDs
 * @returns Map of request ID to status
 */
const batchCheckStatus = async (requestIds: string[]): Promise<Map<string, QueueStatus>> => {
    const statusMap = new Map<string, QueueStatus>();
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < requestIds.length; i += batchSize) {
        const batch = requestIds.slice(i, i + batchSize);
        const promises = batch.map(async (requestId) => {
            try {
                const status = await checkQueueStatus(requestId);
                statusMap.set(requestId, status);
                return { requestId, status };
            } catch (error) {
                console.error(`Error checking status for request ${requestId}:`, error);
                return { requestId, status: null };
            }
        });
        
        await Promise.all(promises);
        
        // Small delay between batches
        if (i + batchSize < requestIds.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return statusMap;
};

export {
    submitToQueue,
    submitToQueueWithTracking,
    checkQueueStatus,
    getQueueResult,
    pollForResult,
    getPendingRequestsForTopic,
    updateRequestStatus,
    getRequest,
    removeRequest,
    batchCheckStatus,
};