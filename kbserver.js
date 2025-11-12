#!/usr/bin/env node

/**
 * kbserver - Simple Claude Code to OpenAI API Bridge
 *
 * This server:
 * 1. Listens on 0.0.0.0:8765
 * 2. Accepts POST/GET requests from Claude Code
 * 3. Transforms Claude Code format to OpenAI format
 * 4. Calls OpenAI API
 * 5. Transforms response back to Claude Code format
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const CONFIG = {
    PORT: 8765,
    HOST: '0.0.0.0',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'gpt-4',
    API_TIMEOUT: 120000 // 2 minutes
};

/**
 * Transform Claude Code request to OpenAI format
 */
function transformClaudeToOpenAI(claudeRequest) {
    const openAIRequest = {
        model: claudeRequest.model || CONFIG.DEFAULT_MODEL,
        messages: [],
        max_tokens: claudeRequest.max_tokens || 4096,
        temperature: claudeRequest.temperature || 1.0,
        stream: claudeRequest.stream || false
    };

    // Transform messages
    if (claudeRequest.messages) {
        openAIRequest.messages = claudeRequest.messages.map(msg => {
            let content = msg.content;

            // Handle array content (Claude format)
            if (Array.isArray(content)) {
                content = content
                    .filter(item => item.type === 'text')
                    .map(item => item.text)
                    .join('');
            }

            return {
                role: msg.role,
                content: content || ''
            };
        });
    }

    // Add system message if present
    if (claudeRequest.system) {
        openAIRequest.messages.unshift({
            role: 'system',
            content: claudeRequest.system
        });
    }

    // Transform tools if present
    if (claudeRequest.tools && claudeRequest.tools.length > 0) {
        openAIRequest.tools = claudeRequest.tools.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.input_schema
            }
        }));
    }

    return openAIRequest;
}

/**
 * Transform OpenAI response to Claude Code format
 */
function transformOpenAIToClaude(openAIResponse, requestId) {
    if (openAIResponse.choices && openAIResponse.choices.length > 0) {
        const choice = openAIResponse.choices[0];

        return {
            id: requestId || `msg_${Date.now()}`,
            type: 'message',
            role: 'assistant',
            content: [{
                type: 'text',
                text: choice.message?.content || ''
            }],
            model: openAIResponse.model,
            stop_reason: choice.finish_reason || 'end_turn',
            stop_sequence: null,
            usage: {
                input_tokens: openAIResponse.usage?.prompt_tokens || 0,
                output_tokens: openAIResponse.usage?.completion_tokens || 0
            }
        };
    }

    throw new Error('Invalid OpenAI response format');
}

/**
 * Transform streaming OpenAI response to Claude format
 */
function transformStreamingChunk(chunk, requestId) {
    try {
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);

                if (data === '[DONE]') {
                    return 'data: [DONE]\n\n';
                }

                const parsed = JSON.parse(data);

                if (parsed.choices && parsed.choices.length > 0) {
                    const delta = parsed.choices[0].delta;

                    if (delta.content) {
                        const claudeEvent = {
                            type: 'content_block_delta',
                            index: 0,
                            delta: {
                                type: 'text_delta',
                                text: delta.content
                            }
                        };

                        return `data: ${JSON.stringify(claudeEvent)}\n\n`;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error transforming streaming chunk:', error);
    }

    return '';
}

/**
 * Make HTTP request to OpenAI API
 */
function makeOpenAIRequest(openAIRequest, isStream = false) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(openAIRequest);
        const apiUrl = new URL('/chat/completions', CONFIG.OPENAI_BASE_URL);

        const options = {
            hostname: apiUrl.hostname,
            port: apiUrl.port || (apiUrl.protocol === 'https:' ? 443 : 80),
            path: apiUrl.pathname + apiUrl.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: CONFIG.API_TIMEOUT
        };

        const req = (apiUrl.protocol === 'https:' ? https : http).request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                if (isStream) {
                    data += chunk;
                    // Process streaming data immediately
                    const transformed = transformStreamingChunk(chunk, openAIRequest.requestId);
                    if (transformed) {
                        res.emit('stream_chunk', transformed);
                    }
                } else {
                    data += chunk;
                }
            });

            res.on('end', () => {
                if (isStream) {
                    resolve({ stream: true, data });
                } else {
                    try {
                        const jsonResponse = JSON.parse(data);
                        resolve(jsonResponse);
                    } catch (error) {
                        reject(new Error(`Invalid JSON response: ${error.message}`));
                    }
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Handle incoming HTTP request
 */
async function handleRequest(req, res) {
    const startTime = Date.now();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'GET') {
        // Health check or info endpoint
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'running',
            version: '1.0.0',
            uptime: Date.now() - startTime,
            endpoint: `http://${CONFIG.HOST}:${CONFIG.PORT}`,
            model: CONFIG.DEFAULT_MODEL
        }));
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const claudeRequest = JSON.parse(body);
            const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            console.log(`[${new Date().toISOString()}] Request ${requestId}:`, {
                model: claudeRequest.model,
                stream: claudeRequest.stream,
                messageCount: claudeRequest.messages?.length || 0
            });

            // Transform Claude request to OpenAI format
            const openAIRequest = transformClaudeToOpenAI(claudeRequest);
            openAIRequest.requestId = requestId;

            // Handle streaming responses
            if (claudeRequest.stream) {
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                });

                // Send initial message start event
                res.write(`data: ${JSON.stringify({
                    type: 'message_start',
                    message: {
                        id: requestId,
                        type: 'message',
                        role: 'assistant',
                        content: [],
                        model: openAIRequest.model,
                        usage: { input_tokens: 0, output_tokens: 0 }
                    }
                })}\n\n`);

                // Make streaming request to OpenAI
                try {
                    const streamResponse = await makeOpenAIRequest(openAIRequest, true);

                    if (streamResponse.stream) {
                        res.write(streamResponse.data);
                    }
                } catch (error) {
                    console.error(`Streaming error for ${requestId}:`, error);
                    res.write(`data: ${JSON.stringify({
                        type: 'error',
                        error: {
                            type: 'api_error',
                            message: error.message
                        }
                    })}\n\n`);
                }

                res.write('data: [DONE]\n\n');
                res.end();

                console.log(`[${new Date().toISOString()}] Streaming completed for ${requestId}`);

            } else {
                // Handle non-streaming responses
                const openAIResponse = await makeOpenAIRequest(openAIRequest, false);
                const claudeResponse = transformOpenAIToClaude(openAIResponse, requestId);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(claudeResponse));

                console.log(`[${new Date().toISOString()}] Request ${requestId} completed:`, {
                    inputTokens: claudeResponse.usage.input_tokens,
                    outputTokens: claudeResponse.usage.output_tokens
                });
            }

        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error:`, error);

            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: {
                    type: 'api_error',
                    message: error.message
                }
            }));
        }
    });

    req.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] Request error:`, error);

        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: {
                    type: 'request_error',
                    message: 'Request processing error'
                }
            }));
        }
    });
}

/**
 * Start the server
 */
function startServer() {
    const server = http.createServer(handleRequest);

    server.listen(CONFIG.PORT, CONFIG.HOST, () => {
        console.log('='.repeat(60));
        console.log('🚀 KBSERVER STARTED');
        console.log('='.repeat(60));
        console.log(`📡 Server: http://${CONFIG.HOST}:${CONFIG.PORT}`);
        console.log(`🤖 OpenAI API: ${CONFIG.OPENAI_BASE_URL}`);
        console.log(`🎯 Default Model: ${CONFIG.DEFAULT_MODEL}`);
        console.log(`⏱️  Timeout: ${CONFIG.API_TIMEOUT}ms`);
        console.log('='.repeat(60));
        console.log('📋 Usage:');
        console.log(`   Claude Code Base URL: http://${CONFIG.HOST}:${CONFIG.PORT}`);
        console.log(`   Health Check: curl http://${CONFIG.HOST}:${CONFIG.PORT}`);
        console.log('='.repeat(60));
        console.log('💡 Tips:');
        console.log('   - Set OPENAI_API_KEY environment variable');
        console.log('   - Set DEFAULT_MODEL environment variable (default: gpt-4)');
        console.log('   - Works with Claude Code via kbcode ccr configuration');
        console.log('='.repeat(60));
    });

    server.on('error', (error) => {
        console.error('Server error:', error);
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        server.close(() => {
            console.log('✅ Server stopped');
            process.exit(0);
        });
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down...');
        server.close(() => {
            console.log('✅ Server stopped');
            process.exit(0);
        });
    });
}

// Start server
if (require.main === module) {
    startServer();
}

module.exports = {
    startServer,
    transformClaudeToOpenAI,
    transformOpenAIToClaude,
    CONFIG
};