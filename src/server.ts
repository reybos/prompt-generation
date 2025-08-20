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

import { runContentPipeline } from './pipeline/index.js';
// Utility functions removed: not implemented
import config from './config/index.js';
import { ContentPackage, PipelineOptions } from './types/pipeline.js';

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

// API endpoint for content generation
app.post('/api/generate', async (req, res) => {
    try {
        const { topics, channelName, model } = req.body;
        if (!topics) {
            return res.status(400).json({ error: 'Missing topics' });
        }
        // Generate a unique requestId for this generation
        const requestId = crypto.randomUUID();
        // Start content generation in the background (do not await)
        processContentGeneration(topics, requestId)
            .catch(err => {
                console.error('Error in background content generation:', err);
                emitLog('Error during content generation: ' + (err?.message || err), requestId);
            });
        // Respond immediately so frontend can connect to SSE
        return res.json({ success: true, requestId });
    } catch (err) {
        console.error('Error in /api/generate:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint for song with animals generation
app.post('/api/generate-song-with-animals', async (req, res) => {
    try {
        const { input, style } = req.body;
        if (!input) {
            return res.status(400).json({ error: 'Missing input' });
        }
        if (!style) {
            return res.status(400).json({ error: 'Missing style parameter' });
        }
        // Generate a unique requestId for this generation
        const requestId = crypto.randomUUID();
        // Start song with animals generation in the background (do not await)
        processSongWithAnimalsGeneration(input, requestId, style)
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

// API endpoint for horror generation
app.post('/api/generate-horror', async (req, res) => {
    try {
        const { input } = req.body;
        if (!input) {
            return res.status(400).json({ error: 'Missing input' });
        }
        // Generate a unique requestId for this generation
        const requestId = crypto.randomUUID();
        // Start horror generation in the background (do not await)
        processHorrorGeneration(input, requestId)
            .catch(err => {
                console.error('Error in background horror animals generation:', err);
                emitLog('Error during horror animals generation: ' + (err?.message || err), requestId);
            });
        // Respond immediately so frontend can connect to SSE
        return res.json({ success: true, requestId });
    } catch (err) {
        console.error('Error in /api/generate-horror:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint for short study generation
app.post('/api/generate-short-study', async (req, res) => {
    try {
        const { input } = req.body;
        if (!input) {
            return res.status(400).json({ error: 'Missing input' });
        }
        // Generate a unique requestId for this generation
        const requestId = crypto.randomUUID();
        // Start short study generation in the background (do not await)
        processShortStudyGeneration(input, requestId)
            .catch(err => {
                console.error('Error in background short study generation:', err);
                emitLog('Error during short study generation: ' + (err?.message || err), requestId);
            });
        // Respond immediately so frontend can connect to SSE
        return res.json({ success: true, requestId });
    } catch (err) {
        console.error('Error in /api/generate-short-study:', err);
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
    const timestamp = new Date().toLocaleTimeString();
    const safeRequestId = requestId || 'anonymous';

    console.log(`[LOG EMITTER] ${log} (requestId: ${safeRequestId}, time: ${timestamp})`);
    logEmitter.emit('log', { log, requestId: safeRequestId, timestamp });
}

// Content generation processor
async function processContentGeneration(
    topics: Record<string, string[]>,
    requestId: string
): Promise<void> {
    const logs: string[] = [];
    const savedFiles: ContentPackage[] = [];

    // Wait for SSE client to connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`[GENERATE] Checking for active connection for requestId: ${requestId}`);
    console.log(`[GENERATE] Active connections: ${activeConnections.size}`);

    for (const theme in topics) {
        const topicList = topics[theme];

        if (!Array.isArray(topicList)) {
            const error = `Topics for theme "${theme}" must be an array`;
            logs.push(error);
            emitLog(error, requestId);
            continue;
        }

        for (const topic of topicList) {
            const startMessage = `Starting content generation for theme: "${theme}", topic: "${topic}"`;
            logs.push(startMessage);
            emitLog(startMessage, requestId);

            const channelMessage = `Using default channel name: ${config.defaultChannelName}`;
            logs.push(channelMessage); // not emitted to client

            try {
                const pipelineOptions: PipelineOptions = {
                    channelName: config.defaultChannelName,
                    requestId,
                    emitLog
                };

                const topicsObj = { [theme]: [topic] };
                const result = await runContentPipeline(topicsObj, pipelineOptions);

                if (!result || !result[theme] || !result[theme][topic]) {
                    const error = `Pipeline failed for theme "${theme}", topic "${topic}".`;
                    logs.push(error);
                    emitLog(error, requestId);
                    continue;
                }

                savedFiles.push(result[theme][topic]);
            } catch (err) {
                const error = `Error during content generation for topic "${topic}": ${err}`;
                logs.push(error);
                emitLog(error, requestId);
            }
        }
    }
}

// Song with animals generation processor
async function processSongWithAnimalsGeneration(
    input: any,
    requestId: string,
    style: string
): Promise<void> {
    const logs: string[] = [];

    // Wait for SSE client to connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`[SONG WITH ANIMALS] Checking for active connection for requestId: ${requestId}`);
    console.log(`[SONG WITH ANIMALS] Active connections: ${activeConnections.size}`);

    try {
        const result = await import('./pipeline/songWithAnimalsPipeline.js').then(m => m.runSongWithAnimalsPipeline(input, { requestId, emitLog: (log: string, reqId?: string) => emitLog(log, reqId), style }));
        
        // Emit completion message with results
        emitLog(`Song with animals generation complete with ${style} style. Generated ${result.length} song(s).`, requestId);
    } catch (err) {
        const error = `Error during song with animals generation: ${err}`;
        logs.push(error);
        emitLog(error, requestId);
    }
}

// Horror generation processor
async function processHorrorGeneration(
    input: any,
    requestId: string
): Promise<void> {
    const logs: string[] = [];

    // Wait for SSE client to connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`[HORROR] Checking for active connection for requestId: ${requestId}`);
    console.log(`[HORROR] Active connections: ${activeConnections.size}`);

    try {
        const result = await import('./pipeline/horrorPipeline.js').then(m => m.runHorrorPipeline(input, { requestId, emitLog: (log: string, reqId?: string) => emitLog(log, reqId) }));
        
        // Emit completion message with results
        emitLog(`Horror animals generation complete. Generated ${result.length} animal(s).`, requestId);
    } catch (err) {
        const error = `Error during horror generation: ${err}`;
        logs.push(error);
        emitLog(error, requestId);
    }
}

// Short study generation processor
async function processShortStudyGeneration(
    input: any,
    requestId: string
): Promise<void> {
    const logs: string[] = [];

    // Wait for SSE client to connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`[SHORT STUDY] Checking for active connection for requestId: ${requestId}`);
    console.log(`[SHORT STUDY] Active connections: ${activeConnections.size}`);

    try {
        const result = await import('./pipeline/shortStudyPipeline.js').then(m => m.runShortStudyPipeline(input, { requestId, emitLog: (log: string, reqId?: string) => emitLog(log, reqId) }));
        
        // Emit completion message with results
        emitLog(`Short study topics generation complete. Generated ${result.length} topic(s).`, requestId);
    } catch (err) {
        const error = `Error during short study generation: ${err}`;
        logs.push(error);
        emitLog(error, requestId);
    }
}



// Utility to resolve the generations directory
export function getGenerationsDir() {
    if (config.generationsDirPath) {
        return config.generationsDirPath;
    } else if (config.generationsDirRelativePath) {
        return path.resolve(process.cwd(), config.generationsDirRelativePath);
    }
    return null;
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