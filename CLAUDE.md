  # ==================================
# LINUX INSTALLATION
# ==================================

# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Create directory
mkdir -p /root/kbcode/

# Create GLM config
cat > /root/kbcode/glm.ini << 'EOF'
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "your-token-api",
        "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
        "API_TIMEOUT_MS": "3000000"
    },
    "alwaysThinkingEnabled": true
}
EOF

# Create Claude config
cat > /root/kbcode/claude.ini << 'EOF'
{
    "env": {},
    "alwaysThinkingEnabled": true
}
EOF

# Set permissions for config files
chmod 644 /root/kbcode/glm.ini
chmod 644 /root/kbcode/claude.ini

# Download kbcode script
wget https://raw.githubusercontent.com/khoaofgod/kbcode/refs/heads/master/kbcode -O /root/kbcode/kbcode

# Make executable
chmod +x /root/kbcode/kbcode

# Create symbolic link
ln -s /root/kbcode/kbcode /usr/local/bin/kbcode

# ==================================
# WINDOWS INSTALLATION
# ==================================

# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Clone or download the repository
git clone https://github.com/khoaofgod/kbcode.git C:\kbcode
# OR download and extract to C:\kbcode

# Navigate to the kbcode directory
cd C:\kbcode

# The configuration files (glm.ini and claude.ini) and kbcode.bat are already included
# Add C:\kbcode to your PATH environment variable for global access

# Usage:
# kbcode.bat glm      - Switch to GLM API configuration and run Claude
# kbcode.bat claude   - Switch to default Claude configuration and run Claude
# kbcode.bat help     - Show help message
