#!/usr/bin/env node

/**
 * Test script for kbserver
 */

const http = require('http');

const SERVER_URL = 'http://127.0.0.1:8765';

function testHealthCheck() {
    return new Promise((resolve, reject) => {
        http.get(SERVER_URL, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('✅ Health check passed:', response);
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

function testClaudeRequest() {
    return new Promise((resolve, reject) => {
        const claudeRequest = {
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: 'Hello, this is a test message. Please respond with "Hello from kbserver!"'
                }
            ],
            max_tokens: 100,
            stream: false
        };

        const postData = JSON.stringify(claudeRequest);

        const options = {
            hostname: '127.0.0.1',
            port: 8765,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('✅ Claude request test passed:', response);
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting kbserver tests...');

    try {
        await testHealthCheck();
        await testClaudeRequest();
        console.log('🎉 All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run tests if called directly
if (require.main === module) {
    runTests();
}

module.exports = { testHealthCheck, testClaudeRequest, runTests };