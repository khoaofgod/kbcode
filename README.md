# kbcode - Claude Code Configuration Manager

A cross-platform tool that allows you to easily switch between different Claude Code API configurations (GLM API vs default Claude) and launch Claude Code with the appropriate settings.

## Features

- 🔄 **Switch between API configurations**: GLM API or default Claude
- 🌍 **Automatic environment variables**: Sets `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL`, and `API_TIMEOUT_MS`
- 🚀 **Automatic backup**: Backs up current settings before switching
- 💻 **Cross-platform**: Works on both Windows and Linux
- 🎯 **Simple commands**: `kbcode glm`, `kbcode claude`, `kbcode help`
- ⏯️ **Resume support**: Supports `--resume` parameter for continuing sessions
- 🧹 **Clean environment**: Unsets variables when switching to configurations without them

## Prerequisites

- [Node.js and npm](https://nodejs.org/) installed
- [Claude Code CLI](https://claude.ai/claude-code) installed:
  ```bash
  npm install -g @anthropic-ai/claude-code
  ```

## Installation

### Option 1: Clone the Repository

```bash
git clone https://github.com/khoaofgod/kbcode.git
cd kbcode
```

### Option 2: Download Files

Download the following files from the repository:
- `kbcode` (Linux) or `kbcode.bat` (Windows)
- `glm.ini`
- `claude.ini`

## Platform Setup

### 🐧 Linux Setup

1. **Move files to system directory**:
   ```bash
   sudo mkdir -p /etc/kbcode/
   sudo chmod 0777 /etc/kbcode/
   sudo cp kbcode glm.ini claude.ini /etc/kbcode/
   sudo chmod 0666 /etc/kbcode/glm.ini /etc/kbcode/claude.ini
   ```

2. **Make executable**:
   ```bash
   sudo chmod +x /etc/kbcode/kbcode
   ```

3. **Create global symbolic link**:
   ```bash
   sudo ln -s /etc/kbcode/kbcode /usr/local/bin/kbcode
   ```

4. **Verify installation**:
   ```bash
   kbcode help
   ```

### 🪟 Windows Setup

#### Method 1: Add to PATH (Recommended)

1. **Choose installation directory** (e.g., `C:\kbcode`):

   **Using PowerShell:**
   ```powershell
   mkdir C:\kbcode
   Copy-Item kbcode.bat, glm.ini, claude.ini C:\kbcode\
   ```

   **Using Command Prompt (cmd):**
   ```cmd
   mkdir C:\kbcode
   copy kbcode.bat glm.ini claude.ini C:\kbcode\
   ```

2. **Add to PATH**:
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → "Environment Variables"
   - Under "System variables", find "Path", click "Edit"
   - Click "New", add `C:\kbcode`
   - Click OK on all windows

3. **Restart Command Prompt/PowerShell** to refresh PATH

4. **Verify installation**:
   ```cmd
   kbcode.bat help
   ```

#### Method 2: System-Wide Batch File

1. **Copy to Windows directory**:

   **Using PowerShell:**
   ```powershell
   Copy-Item kbcode.bat, glm.ini, claude.ini C:\Windows\
   ```

   **Using Command Prompt (cmd):**
   ```cmd
   copy kbcode.bat glm.ini claude.ini C:\
   ```

2. **Verify installation**:
   ```cmd
   kbcode.bat help
   ```

#### Method 3: PowerShell Alias

Add to your PowerShell profile (`%USERPROFILE%\Documents\WindowsPowerShell\Profile.ps1`):

```powershell
Set-Alias -Name kbcode -Value "C:\path\to\kbcode\kbcode.bat"
function kbcode {
    & "C:\path\to\kbcode\kbcode.bat" $args
}
```

## Usage

### Basic Commands

```bash
# Switch to GLM API and run Claude
kbcode glm

# Switch to default Claude and run Claude
kbcode claude

# Show help message
kbcode help

# Resume last session with GLM API
kbcode glm --resume

# Resume last session with default Claude
kbcode claude --resume
```

### What Happens When You Run Commands

1. **Configuration Copy**: Copies the appropriate `.ini` file to `~/.claude/settings.json`
2. **Environment Variables**: Reads `settings.json` and automatically sets:
   - `ANTHROPIC_AUTH_TOKEN` (API authentication token)
   - `ANTHROPIC_BASE_URL` (API endpoint URL)
   - `API_TIMEOUT_MS` (request timeout in milliseconds)
3. **Automatic Backup**: Creates timestamped backup of existing settings before switching
4. **Launch Claude**: Starts Claude Code with the correct environment variables
5. **Cleanup**: Unsets variables if they're not present in the configuration

## Configuration Files

### GLM Configuration (`glm.ini`)
```json
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "your-glm-token-here",
        "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
        "API_TIMEOUT_MS": "3000000"
    },
    "alwaysThinkingEnabled": true
}
```

### Claude Configuration (`claude.ini`)
```json
{
    "env": {},
    "alwaysThinkingEnabled": true
}
```

## Troubleshooting

### Windows Issues

**Command not found**:
- Verify the directory is in your PATH: `echo %PATH%`
- Restart Command Prompt/PowerShell after adding to PATH
- Try full path: `C:\kbcode\kbcode.bat help`

**Permission denied**:
- Run Command Prompt as Administrator
- Check file permissions: `icacls kbcode.bat`

**Claude not found**:
- Verify Claude Code installation: `npm list -g @anthropic-ai/claude-code`
- Reinstall: `npm install -g @anthropic-ai/claude-code`

### Linux Issues

**Command not found**:
- Check if symlink exists: `ls -la /usr/local/bin/kbcode`
- Verify script is executable: `ls -la /etc/kbcode/kbcode`
- Try full path: `/etc/kbcode/kbcode help`

**Permission denied**:
- Run with sudo: `sudo /etc/kbcode/kbcode help`
- Check permissions: `ls -la /etc/kbcode/`

**Claude not found**:
- Check npm global installation: `npm list -g @anthropic-ai/claude-code`
- Verify npm global bin directory is in PATH: `echo $PATH`

### General Issues

**Configuration file not found**:
- Ensure `glm.ini` and `claude.ini` are in the same directory as the script
- Check file paths in error messages

**Settings not applying**:
- Check `~/.claude/settings.json` exists and has correct content
- Verify backup files are being created in `~/.claude/`

## File Locations

### Windows
- Script: `C:\kbcode\kbcode.bat` (or your chosen location)
- Configs: `C:\kbcode\glm.ini`, `C:\kbcode\claude.ini`
- Settings: `%USERPROFILE%\.claude\settings.json`
- Backups: `%USERPROFILE%\.claude\settings.json.backup.*`

### Linux
- Script: `/etc/kbcode/kbcode`
- Configs: `/etc/kbcode/glm.ini`, `/etc/kbcode/claude.ini`
- Settings: `~/.claude/settings.json`
- Backups: `~/.claude/settings.json.backup.*`

## Advanced Usage

### Custom API Configuration

Edit the `.ini` files to use different API endpoints:

```json
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "your-custom-token",
        "ANTHROPIC_BASE_URL": "https://your-custom-api.com/anthropic",
        "API_TIMEOUT_MS": "60000"
    },
    "alwaysThinkingEnabled": true
}
```

### Multiple Profiles

You can extend the script by adding new configuration files and updating the case statement to support additional API providers.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both Windows and Linux
5. Submit a pull request

## License

This project is open source. Feel free to modify and distribute according to your needs.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check that configuration files exist and are readable
4. Open an issue on the GitHub repository