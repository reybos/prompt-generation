/**
 * Express server for the prompt generation application
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import fs from 'fs';
import crypto from 'crypto';

import { runHalloweenTransformPipeline, runHalloweenTransformTwoFramePipeline, runPoemsPipeline } from './pipeline/index.js';
// Utility functions removed: not implemented
import config, { getGenerationsDir } from './config/index.js';
import { ContentPackage, PipelineOptions, HalloweenInput, PoemsInput } from './types/pipeline.js';

// Get the directory name using ES modules approach
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

// Create Express app
const app = express();
const PORT: number = parseInt(process.env.PORT || '4000');

// Typed event emitter
interface LogEventData {
    log: string;
    requestId: string;
    timestamp: string;
}

interface ServerEvents {
    log: LogEventData;
}

class TypedEventEmitter<T extends Record<string, any>> {
    private emitter = new EventEmitter();

    on<K extends keyof T>(event: K, listener: (data: T[K]) => void): this {
        this.emitter.on(event as string, listener);
        return this;
    }

    emit<K extends keyof T>(event: K, data: T[K]): boolean {
        return this.emitter.emit(event as string, data);
    }

    off<K extends keyof T>(event: K, listener: (data: T[K]) => void): this {
        this.emitter.off(event as string, listener);
        return this;
    }
}

// Create log emitter
const logEmitter = new TypedEventEmitter<ServerEvents>();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// API endpoint for song with animals generation
app.post('/api/generate-song-with-animals', async (req, res) => {
    try {
        const { input, style, generateAdditionalFrames } = req.body;
        if (!input) {
            return res.status(400).json({ error: 'Missing input' });
        }
        if (!style) {
            return res.status(400).json({ error: 'Missing style parameter' });
        }
        // Generate a unique requestId for this generation
        const requestId = crypto.randomUUID();
        // Start song with animals generation in the background (do not await)
        processSongWithAnimalsGeneration(input, requestId, style, generateAdditionalFrames)
            .catch(err => {
                console.error('Error in background song with animals generation:', err);
                emitLog('Error during song with animals generation: ' + (err?.message || err), requestId);
            });
        // Respond immediately so frontend can connect to SSE
        return res.json({ success: true, requestId });
    } catch (err) {
        console.error('Error in /api/generate-song-with-animals:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint for Halloween generation
app.post('/api/generate-halloween', async (req, res) => {
    try {
        const { input, generateAdditionalFrames } = req.body;
        if (!input) {
            return res.status(400).json({ error: 'Missing input' });
        }
        // Generate a unique requestId for this generation
        const requestId = crypto.randomUUID();
        // Start Halloween generation in the background (do not await)
        processHalloweenGeneration(input, requestId, generateAdditionalFrames)
            .catch(err => {
                console.error('Error in background Halloween generation:', err);
                emitLog('Error during Halloween generation: ' + (err?.message || err), requestId);
            });
        // Respond immediately so frontend can connect to SSE
        return res.json({ success: true, requestId });
    } catch (err) {
        console.error('Error in /api/generate-halloween_dance:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint for Halloween Transform generation
app.post('/api/generate-halloween-transform', async (req, res) => {
    try {
        const { input, generateAdditionalFrames } = req.body;
        if (!input) {
            return res.status(400).json({ error: 'Missing input' });
        }
        // Generate a unique requestId for this generation
        const requestId = crypto.randomUUID();
        // Start Halloween Transform generation in the background (do not await)
        processHalloweenTransformGeneration(input, requestId, generateAdditionalFrames)
            .catch(err => {
                console.error('Error in background Halloween Transform generation:', err);
                emitLog('Error during Halloween Transform generation: ' + (err?.message || err), requestId);
            });
        // Respond immediately so frontend can connect to SSE
        return res.json({ success: true, requestId });
    } catch (err) {
        console.error('Error in /api/generate-halloween_dance-transform:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint for Halloween Transform Two Frame generation
app.post('/api/generate-halloween-transform-two-frame', async (req, res) => {
    try {
        const { input, generateAdditionalFrames } = req.body;
        if (!input) {
            return res.status(400).json({ error: 'Missing input' });
        }
        // Generate a unique requestId for this generation
        const requestId = crypto.randomUUID();
        // Start Halloween Transform Two Frame generation in the background (do not await)
        processHalloweenTransformTwoFrameGeneration(input, requestId, generateAdditionalFrames)
            .catch(err => {
                console.error('Error in background Halloween Transform Two Frame generation:', err);
                emitLog('Error during Halloween Transform Two Frame generation: ' + (err?.message || err), requestId);
            });
        // Respond immediately so frontend can connect to SSE
        return res.json({ success: true, requestId });
    } catch (err) {
        console.error('Error in /api/generate-halloween-transform-two-frame:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint for Poems generation
app.post('/api/generate-poems', async (req, res) => {
    try {
        const { input, generateAdditionalFrames, linesPerVideo } = req.body;
        if (!input) {
            return res.status(400).json({ error: 'Missing input' });
        }
        // Generate a unique requestId for this generation
        const requestId = crypto.randomUUID();
        // Start Poems generation in the background (do not await)
        processPoemsGeneration(input, requestId, generateAdditionalFrames, linesPerVideo)
            .catch(err => {
                console.error('Error in background Poems generation:', err);
                emitLog('Error during Poems generation: ' + (err?.message || err), requestId);
            });
        // Respond immediately so frontend can connect to SSE
        return res.json({ success: true, requestId });
    } catch (err) {
        console.error('Error in /api/generate-poems:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint for getting available styles
app.get('/api/styles', async (req, res) => {
    try {
        const { getAvailableStyles } = await import('./promts/song_with_animals/styles/styleConfig.js');
        const styles = getAvailableStyles();
        res.json({ success: true, styles });
    } catch (error) {
        console.error('Error getting styles:', error);
        res.status(500).json({ error: 'Failed to get styles' });
    }
});

// SSE endpoint for streaming logs to the frontend
app.get('/api/logs/stream', (req, res) => {
    const { requestId } = req.query;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send a connected message
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    // Log event handler
    const onLog = (data: { log: string; requestId: string; timestamp: string }) => {
        if (!requestId || data.requestId === requestId) {
            res.write(`data: ${JSON.stringify({ type: 'log', ...data })}\n\n`);
        }
    };
    logEmitter.on('log', onLog);

    // Clean up when client disconnects
    req.on('close', () => {
        logEmitter.off('log', onLog);
        res.end();
    });
});

// Store active SSE connections
const activeConnections = new Map<string, Response>();

// Emit log helper
function emitLog(log: string, requestId?: string): void {
    const now = new Date();
    const timestamp = now.toISOString();
    const safeRequestId = requestId || 'anonymous';

    console.log(`[LOG EMITTER] ${log} (requestId: ${safeRequestId}, time: ${timestamp})`);
    logEmitter.emit('log', { log, requestId: safeRequestId, timestamp });
}

// Song with animals generation processor
async function processSongWithAnimalsGeneration(
    input: any,
    requestId: string,
    style: string,
    generateAdditionalFrames?: boolean
): Promise<void> {
    const logs: string[] = [];

    // Wait for SSE client to connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`[SONG WITH ANIMALS] Checking for active connection for requestId: ${requestId}`);
    console.log(`[SONG WITH ANIMALS] Active connections: ${activeConnections.size}`);

    try {
        const result = await import('./pipeline/songWithAnimalsPipeline.js').then(m => m.runSongWithAnimalsPipeline(input, { 
            requestId, 
            emitLog: (log: string, reqId?: string) => emitLog(log, reqId), 
            style,
            generateAdditionalFrames: generateAdditionalFrames || false
        }));
        
        // Emit completion message with results
        const additionalFramesInfo = generateAdditionalFrames ? ' (with additional frames)' : '';
        emitLog(`Song with animals generation complete with ${style} style${additionalFramesInfo}. Generated ${result.length} song(s).`, requestId);
    } catch (err) {
        const error = `Error during song with animals generation: ${err}`;
        logs.push(error);
        emitLog(error, requestId);
    }
}

// Halloween generation processor
async function processHalloweenGeneration(
    input: HalloweenInput,
    requestId: string,
    generateAdditionalFrames?: boolean
): Promise<void> {
    const logs: string[] = [];

    // Wait for SSE client to connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`[HALLOWEEN] Checking for active connection for requestId: ${requestId}`);
    console.log(`[HALLOWEEN] Active connections: ${activeConnections.size}`);

    try {
        const result = await import('./pipeline/halloweenDancePipeline.js').then(m => m.runHalloweenPipeline(input, {
            requestId, 
            emitLog: (log: string, reqId?: string) => emitLog(log, reqId),
            generateAdditionalFrames: generateAdditionalFrames || false
        }));
        
        // Emit completion message with results
        const additionalFramesInfo = generateAdditionalFrames ? ' (with additional frames)' : '';
        emitLog(`Halloween generation complete${additionalFramesInfo}. Generated ${result.length} song(s).`, requestId);
    } catch (err) {
        const error = `Error during Halloween generation: ${err}`;
        logs.push(error);
        emitLog(error, requestId);
    }
}

// Halloween Transform generation processor
async function processHalloweenTransformGeneration(
    input: HalloweenInput,
    requestId: string,
    generateAdditionalFrames?: boolean
): Promise<void> {
    const logs: string[] = [];

    // Wait for SSE client to connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`[HALLOWEEN TRANSFORM] Checking for active connection for requestId: ${requestId}`);
    console.log(`[HALLOWEEN TRANSFORM] Active connections: ${activeConnections.size}`);

    try {
        const result = await runHalloweenTransformPipeline(input, { 
            requestId, 
            emitLog: (log: string, reqId?: string) => emitLog(log, reqId),
            generateAdditionalFrames: generateAdditionalFrames || false
        });
        
        // Emit completion message with results
        const additionalFramesInfo = generateAdditionalFrames ? ' (with additional frames)' : '';
        emitLog(`Halloween Transform generation complete${additionalFramesInfo}. Generated ${result.length} song(s).`, requestId);
    } catch (err) {
        const error = `Error during Halloween Transform generation: ${err}`;
        logs.push(error);
        emitLog(error, requestId);
    }
}

// Halloween Transform Two Frame generation processor
async function processHalloweenTransformTwoFrameGeneration(
    input: HalloweenInput,
    requestId: string,
    generateAdditionalFrames?: boolean
): Promise<void> {
    const logs: string[] = [];

    // Wait for SSE client to connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`[HALLOWEEN TRANSFORM TWO FRAME] Checking for active connection for requestId: ${requestId}`);
    console.log(`[HALLOWEEN TRANSFORM TWO FRAME] Active connections: ${activeConnections.size}`);

    try {
        const result = await runHalloweenTransformTwoFramePipeline(input, { 
            requestId, 
            emitLog: (log: string, reqId?: string) => emitLog(log, reqId),
            generateAdditionalFrames: generateAdditionalFrames || false
        });
        
        // Emit completion message with results
        const additionalFramesInfo = generateAdditionalFrames ? ' (with additional frames)' : '';
        emitLog(`Halloween Transform Two Frame generation complete${additionalFramesInfo}. Generated ${result.length} song(s).`, requestId);
    } catch (err) {
        const error = `Error during Halloween Transform Two Frame generation: ${err}`;
        logs.push(error);
        emitLog(error, requestId);
    }
}

// Poems generation processor
async function processPoemsGeneration(
    input: PoemsInput,
    requestId: string,
    generateAdditionalFrames?: boolean,
    linesPerVideo?: number
): Promise<void> {
    const logs: string[] = [];

    // Wait for SSE client to connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`[POEMS] Checking for active connection for requestId: ${requestId}`);
    console.log(`[POEMS] Active connections: ${activeConnections.size}`);

    try {
        const result = await runPoemsPipeline(input, {
            requestId, 
            emitLog: (log: string, reqId?: string) => emitLog(log, reqId),
            generateAdditionalFrames: generateAdditionalFrames || false,
            linesPerVideo: linesPerVideo || 1
        });
        
        // Emit completion message with results
        const additionalFramesInfo = generateAdditionalFrames ? ' (with additional frames)' : '';
        emitLog(`Poems generation complete${additionalFramesInfo}. Generated ${result.length} song(s).`, requestId);
    } catch (err) {
        const error = `Error during Poems generation: ${err}`;
        logs.push(error);
        emitLog(error, requestId);
    }
}

// Endpoint to list unprocessed/saved generations
app.get('/api/unprocessed', (req, res) => {
    const generationsDir = getGenerationsDir();
    if (!generationsDir) {
        return res.status(500).json({ success: false, error: 'Generations directory is not configured.' });
    }
    // Ensure the unprocessed directory exists
    const unprocessedDir = path.join(generationsDir, 'unprocessed');
    try {
        if (!fs.existsSync(unprocessedDir)) {
            fs.mkdirSync(unprocessedDir, { recursive: true });
        }
    } catch (mkdirErr) {
        console.error('Failed to create unprocessed directory:', mkdirErr);
        return res.status(500).json({ success: false, error: 'Failed to create unprocessed directory.' });
    }
    return fs.readdir(unprocessedDir, (err, files) => {
        if (err) {
            console.error('Failed to read unprocessed directory:', err); // Debug log
            return res.status(500).json({ success: false, error: 'Failed to read unprocessed directory.' });
        }
        const generations = files.filter(file => file.endsWith('.json')).map(file => ({ filename: file }));
        return res.json({ success: true, generations });
    });
});

// Endpoint to get a single unprocessed generation file
app.get('/api/unprocessed/:filename', (req, res) => {
    const generationsDir = getGenerationsDir();
    if (!generationsDir) {
        return res.status(500).json({ success: false, error: 'Generations directory is not configured.' });
    }
    const unprocessedDir = path.join(generationsDir, 'unprocessed');
    const filename = req.params.filename;
    const filePath = path.join(unprocessedDir, filename);
    return fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(404).json({ success: false, error: 'File not found.' });
        }
        return res.json({ success: true, content: data });
    });
});

// Start the Express server
export function startServer() {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}