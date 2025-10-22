  # ==================================
# LINUX INSTALLATION
# ==================================

# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Create directory
mkdir -p /etc/kbcode/

# Set directory permissions for all users
chmod 0777 /etc/kbcode/

# Create GLM config
cat > /etc/kbcode/glm.ini << 'EOF'
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
cat > /etc/kbcode/claude.ini << 'EOF'
{
    "env": {},
    "alwaysThinkingEnabled": true
}
EOF

# Set permissions for config files (readable and writable by all)
chmod 0666 /etc/kbcode/glm.ini
chmod 0666 /etc/kbcode/claude.ini

# Download kbcode script
wget https://raw.githubusercontent.com/khoaofgod/kbcode/refs/heads/master/kbcode -O /etc/kbcode/kbcode

# Make executable
chmod +x /etc/kbcode/kbcode

# Create symbolic link
ln -s /etc/kbcode/kbcode /usr/local/bin/kbcode

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
