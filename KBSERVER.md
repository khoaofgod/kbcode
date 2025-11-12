# KBSERVER - Claude Code to OpenAI API Bridge

A simple HTTP server that acts as a bridge between Claude Code and OpenAI API, transforming requests and responses between the two different API formats.

## 🚀 Quick Start

### Installation

1. **Ensure Node.js is installed** (v14+):
```bash
node --version
```

2. **Navigate to kbcode directory**:
```bash
cd /path/to/kbcode
```

3. **Start the server**:
```bash
# Basic start
node kbserver.js

# Or with npm
npm start
```

### Configuration

Set environment variables before starting:

```bash
# Required: OpenAI API Key
export OPENAI_API_KEY="your-openai-api-key-here"

# Optional: Default model (default: gpt-4)
export DEFAULT_MODEL="gpt-4"

# Optional: Custom OpenAI base URL
export OPENAI_BASE_URL="https://api.openai.com/v1"

# Start server
node kbserver.js
```

## 📋 Usage

### Server Information

**Default Configuration:**
- **Host**: `0.0.0.0` (listens on all interfaces)
- **Port**: `8765`
- **Default Model**: `gpt-4`
- **Timeout**: 120 seconds

### Health Check

```bash
curl http://127.0.0.1:8765
```

**Response:**
```json
{
  "status": "running",
  "version": "1.0.0",
  "uptime": 1234,
  "endpoint": "http://0.0.0.0:8765",
  "model": "gpt-4"
}
```

### Integration with kbcode

1. **Update kbcode ccr configuration** to point to kbserver:
```ini
# kbserver-config.ini
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "kbserver-token",
        "ANTHROPIC_BASE_URL": "http://127.0.0.1:8765",
        "API_TIMEOUT_MS": "120000"
    },
    "alwaysThinkingEnabled": false
}
```

2. **Use with kbcode**:
```bash
kbcode kbserver-config m2          # Use kbserver with MiniMax-M2 model
kbcode kbserver-config gpt-4      # Use kbserver with GPT-4
kbcode kbserver-config --resume  # Resume with kbserver
```

## 🔄 API Transformation

### Claude Code → OpenAI

**Input (Claude Code format):**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Hello world"
        }
      ]
    }
  ],
  "system": "You are helpful assistant",
  "max_tokens": 1000,
  "stream": false
}
```

**Transformed to OpenAI format:**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are helpful assistant"
    },
    {
      "role": "user",
      "content": "Hello world"
    }
  ],
  "max_tokens": 1000,
  "temperature": 1.0,
  "stream": false
}
```

### OpenAI → Claude Code

**Input (OpenAI format):**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "model": "gpt-4",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8
  }
}
```

**Transformed to Claude Code format:**
```json
{
  "id": "req_123456789",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Hello! How can I help you?"
    }
  ],
  "model": "gpt-4",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 10,
    "output_tokens": 8
  }
}
```

## 🛠️ Features

### ✅ **Implemented**

- **HTTP Server**: Listens on 0.0.0.0:8765
- **CORS Support**: Cross-origin requests enabled
- **Request Transformation**: Claude Code → OpenAI format
- **Response Transformation**: OpenAI → Claude Code format
- **Streaming Support**: Handles SSE streaming responses
- **Error Handling**: Comprehensive error reporting
- **Health Check**: GET endpoint for server status
- **Logging**: Request/response logging
- **Graceful Shutdown**: SIGINT/SIGTERM handling

### 🔄 **Transformation Logic**

**Message Content Handling:**
- Array content (Claude) → String content (OpenAI)
- Text blocks extracted and joined
- System messages converted to first message in array

**Tool Support:**
- Claude tools → OpenAI function calling format
- Tool definitions transformed automatically
- Tool calls handled in streaming mode

**Streaming:**
- OpenAI SSE → Claude SSE format
- Real-time content delta transformation
- Proper event sequence maintained

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | `your-openai-api-key-here` | OpenAI API authentication key |
| `DEFAULT_MODEL` | `gpt-4` | Default model to use |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | OpenAI API base URL |
| `PORT` | `8765` | Server port |
| `HOST` | `0.0.0.0` | Server host |

### Server Configuration

```javascript
const CONFIG = {
    PORT: 8765,
    HOST: '0.0.0.0',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'gpt-4',
    API_TIMEOUT: 120000
};
```

## 🧪 Testing

### Health Check Test
```bash
curl http://127.0.0.1:8765
```

### Basic Request Test
```bash
curl -X POST http://127.0.0.1:8765 \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'
```

### Using Test Script
```bash
node test-kbserver.js
```

## 🔍 Debugging

### Server Logs
The server provides detailed logging:
```
[2025-11-12T19:08:34.373Z] Request req_123456: {
  model: 'gpt-4',
  stream: false,
  messageCount: 1
}

[2025-11-12T19:08:35.123Z] Request req_123456 completed: {
  inputTokens: 10,
  outputTokens: 8
}
```

### Common Issues

**Invalid API Key:**
```
Error: 401 {"error":{"message":"Invalid API key"}}
```
**Solution**: Set valid `OPENAI_API_KEY` environment variable

**Connection Timeout:**
```
Error: Request timeout
```
**Solution**: Check internet connection or increase `API_TIMEOUT`

**Port Already in Use:**
```
Error: listen EADDRINUSE :::8765
```
**Solution**: Change `PORT` environment variable or stop conflicting service

## 🚀 Production Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start kbserver.js --name "kbserver"
pm2 logs kbserver
pm2 monit
```

### Using Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8765
CMD ["node", "kbserver.js"]
```

### Systemd Service
```ini
[Unit]
Description=KBSERVER
After=network.target

[Service]
Type=simple
User=kbserver
WorkingDirectory=/opt/kbserver
ExecStart=/usr/bin/node /opt/kbserver/kbserver.js
Restart=always
RestartSec=10
Environment=OPENAI_API_KEY=your-key-here

[Install]
WantedBy=multi-user.target
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and support:
1. Check the debugging section above
2. Verify environment variables are set correctly
3. Test with the provided test script
4. Open an issue on GitHub

---

**KBSERVER** - Bridging Claude Code and OpenAI APIs seamlessly! 🚀