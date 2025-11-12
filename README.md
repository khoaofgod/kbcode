# kbcode - Dynamic Claude Code Configuration Manager

A powerful tool that allows you to easily switch between different Claude Code API configurations, models, and providers with simple commands.

## 🚀 Quick Start

### Installation

1. **Install Claude Code** (if not already installed):
```bash
npm install -g @anthropic-ai/claude-code
```

2. **Install kbcode**:
```bash
# System-wide installation (recommended)
sudo mkdir -p /etc/kbcode/
sudo chmod 0777 /etc/kbcode/
sudo cp kbcode /etc/kbcode/
sudo chmod +x /etc/kbcode/kbcode
sudo ln -s /etc/kbcode/kbcode /usr/local/bin/kbcode

# Or copy to your home directory for personal use
mkdir -p ~/kbcode
cp kbcode ~/kbcode/
chmod +x ~/kbcode/kbcode
echo 'export PATH="$HOME/kbcode:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

3. **Copy configuration files**:
```bash
sudo cp *.ini /etc/kbcode/
sudo chmod 0666 /etc/kbcode/*.ini
```

### Basic Usage

```bash
# Use GLM API configuration
kbcode glm

# Use GLM with specific model
kbcode glm claude-3-5-sonnet-20241022

# Use GLM with model aliases (m2 = MiniMax-M2)
kbcode glm m2

# Use different models for different tasks
kbcode glm claude-3-5-sonnet claude-3-haiku

# List all available configurations
kbcode list

# Show help
kbcode help
```

## 📁 Configuration Files

### Configuration Search Order

kbcode looks for configuration files in this order:

1. **Current directory**: `./config.ini`
2. **User directory**: `~/kbcode/config.ini`
3. **System directory**: `/etc/kbcode/config.ini`

### Basic Configuration File (.ini)

Create `.ini` files with this JSON format:

```json
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "your-api-token-here",
        "ANTHROPIC_BASE_URL": "https://api.example.com/anthropic",
        "API_TIMEOUT_MS": "120000"
    },
    "alwaysThinkingEnabled": true
}
```

### Example Configuration Files

**GLM Configuration (`glm.ini`)**:
```json
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "your-glm-token",
        "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
        "API_TIMEOUT_MS": "3000000"
    },
    "alwaysThinkingEnabled": true
}
```

**Vertex AI Configuration (`vertex.ini`)**:
```json
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "your-vertex-token",
        "ANTHROPIC_BASE_URL": "https://generativelanguage.googleapis.com/anthropic",
        "API_TIMEOUT_MS": "120000",
        "CLAUDE_CODE_USE_VERTEX": "true"
    },
    "alwaysThinkingEnabled": false
}
```

**Default Claude Configuration (`claude.ini`)**:
```json
{
    "env": {},
    "alwaysThinkingEnabled": true
}
```

## 🎯 Model Configuration

### Model Specification

kbcode supports flexible model configuration:

```bash
# Set all models to the same model
kbcode glm claude-3-5-sonnet-20241022

# Set Sonnet to one model, others to another
kbcode glm claude-3-5-sonnet claude-3-haiku
# Result: SONNET=claude-3-5-sonnet, HAIKU=claude-3-haiku, OPUS=claude-3-haiku
```

### Model Aliases

Create a `model-alias.ini` file to use short aliases for long model names:

```json
{
    "m2": "MiniMax-M2",
    "k2": "moonshotai/kimi-k2-thinking",
    "glm": "z-ai/glm-4.6",
    "glm-thinking": "z-ai/glm-4.6:thinking",
    "deepseek": "deepseek-ai/deepseek-v3.2-exp",
    "deepseek-thinking": "deepseek-ai/deepseek-v3.2-exp-thinking"
}
```

**Using aliases:**
```bash
kbcode glm m2                    # Uses MiniMax-M2
kbcode glm glm                   # Uses z-ai/glm-4.6
kbcode glm glm-thinking          # Uses z-ai/glm-4.6:thinking
kbcode glm deepseek              # Uses deepseek-ai/deepseek-v3.2-exp
kbcode glm deepseek-thinking     # Uses deepseek-ai/deepseek-v3.2-exp-thinking
kbcode glm m2 k2                 # Sonnet=MiniMax-M2, others=moonshotai/kimi-k2-thinking
kbcode vertex k2                 # Uses moonshotai/kimi-k2-thinking with Vertex config
```

## 🛠️ Advanced Features

### Flags

```bash
# Resume last session
kbcode glm m2 --resume

# Skip --dangerously-skip-permissions (safer mode)
kbcode claude --no-danger

# Combine flags
kbcode glm s4 h3 --resume --no-danger
```

### Environment Variables

kbcode automatically sets these environment variables from your `.ini` files:

**Common Variables:**
- `ANTHROPIC_AUTH_TOKEN` - API authentication token
- `ANTHROPIC_BASE_URL` - API endpoint URL
- `API_TIMEOUT_MS` - Request timeout in milliseconds

**Model Variables:**
- `ANTHROPIC_MODEL` - Main model selection
- `ANTHROPIC_DEFAULT_SONNET_MODEL` - Sonnet model configuration
- `ANTHROPIC_DEFAULT_HAIKU_MODEL` - Haiku model configuration
- `ANTHROPIC_DEFAULT_OPUS_MODEL` - Opus model configuration
- `CLAUDE_CODE_MAX_OUTPUT_TOKENS` - Maximum output tokens
- `MAX_THINKING_TOKENS` - Extended thinking token budget

**Provider Variables:**
- `CLAUDE_CODE_USE_VERTEX` - Use Google Vertex AI
- `CLAUDE_CODE_USE_BEDROCK` - Use AWS Bedrock

## 📋 Command Reference

### Basic Commands

```bash
kbcode <config>                    # Use configuration
kbcode <config> <model>            # Use config with specific model
kbcode <config> <model1> <model2>  # Use config with dual models
kbcode list                        # Show all configurations
kbcode help                        # Show help
```

### Examples

```bash
# Basic usage
kbcode glm                         # Use GLM API
kbcode vertex                      # Use Vertex AI
kbcode claude                      # Use default Claude

# With models
kbcode glm claude-3-5-sonnet-20241022
kbcode glm m2                      # Using alias (MiniMax-M2)
kbcode glm glm                     # Using alias (z-ai/glm-4.6)
kbcode glm glm-thinking            # Using alias (z-ai/glm-4.6:thinking)
kbcode glm deepseek k2             # Dual models (deepseek + k2)

# With flags
kbcode glm m2 --resume
kbcode claude --no-danger
kbcode vertex k2 --resume --no-danger

# Management
kbcode list                        # Show available configs
kbcode help                        # Show detailed help
```

## 🏗️ Project Structure

### System-Wide Setup
```
/etc/kbcode/
├── kbcode              # Main script
├── glm.ini             # GLM configuration
├── claude.ini          # Default Claude config
├── vertex.ini          # Vertex AI config
├── model-alias.ini     # Model aliases
└── custom.ini          # Your custom configs
```

### User Setup
```
~/kbcode/
├── my-glm.ini          # Personal GLM config
├── my-vertex.ini       # Personal Vertex config
└── my-aliases.ini      # Personal aliases
```

### Project Setup
```
/my-project/
├── project.ini         # Project-specific config
├── model-alias.ini     # Project-specific aliases
└── .env               # Environment files (optional)
```

## 🎯 Use Cases

### 1. Project-Specific Configuration
```bash
cd /my-ai-project/
# Create project.ini with project-specific settings
kbcode project model-name
```

### 2. Team Configuration Sharing
```bash
# Share configurations with team via git
git clone git@github.com:myteam/kbcode-configs.git ~/kbcode
kbcode team-glm m2
```

### 3. Multi-Provider Setup
```bash
# Switch between different providers easily
kbcode glm m2           # GLM provider
kbcode vertex k2        # Vertex AI provider
kbcode custom ds        # Custom provider
```

### 4. Development vs Production
```bash
kbcode dev claude-3-5-sonnet      # Development config
kbcode prod claude-opus-4         # Production config
```

## 🔧 Troubleshooting

### Common Issues

**Command not found:**
```bash
# Check if kbcode is in PATH
which kbcode

# If not found, add to PATH
echo 'export PATH="/path/to/kbcode:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Configuration not found:**
```bash
# Check what configurations are available
kbcode list

# Check search locations
kbcode help  # Shows search order
```

**Permission denied:**
```bash
# Make script executable
chmod +x kbcode

# Check file permissions
ls -la kbcode
```

### Debug Mode

Check what kbcode is doing:
```bash
# List all configurations with their locations
kbcode list

# Check which config file will be used
ls -la ./config.ini ~/kbcode/config.ini /etc/kbcode/config.ini
```

## 📚 Advanced Configuration

### Custom Environment Variables

You can add any Claude Code environment variable to your `.ini` files:

```json
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "your-token",
        "ANTHROPIC_BASE_URL": "https://api.example.com",
        "API_TIMEOUT_MS": "120000",
        "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "8192",
        "MAX_THINKING_TOKENS": "20000",
        "DISABLE_COST_WARNINGS": "true",
        "HTTP_PROXY": "http://proxy.example.com:8080"
    },
    "alwaysThinkingEnabled": true
}
```

### Complete Example

**My Custom Configuration (`my-setup.ini`)**:
```json
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "sk-your-custom-token",
        "ANTHROPIC_BASE_URL": "https://my-custom-api.com/anthropic",
        "API_TIMEOUT_MS": "180000",
        "ANTHROPIC_DEFAULT_SONNET_MODEL": "claude-3-5-sonnet-20241022",
        "ANTHROPIC_DEFAULT_HAIKU_MODEL": "claude-3-5-haiku-20241022",
        "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "16384",
        "MAX_THINKING_TOKENS": "25000",
        "DISABLE_COST_WARNINGS": "false"
    },
    "alwaysThinkingEnabled": true
}
```

**Usage:**
```bash
kbcode my-setup
kbcode my-setup custom-model
kbcode my-setup sonnet-model haiku-model --resume
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

## 📄 License

This project is open source. Feel free to modify and distribute according to your needs.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all files exist and are readable
3. Check that configuration files are valid JSON
4. Run `kbcode help` for usage information
5. Open an issue on the GitHub repository

---

**Happy coding with kbcode! 🚀**