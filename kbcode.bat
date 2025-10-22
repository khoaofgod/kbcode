@echo off
REM kbcode.bat - Windows Global command for managing Claude Code configurations
REM Author: Generated for system-wide usage
REM Description: Switch between different Claude Code API configurations

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM Colors for output (Windows batch doesn't have native colors, so we'll use simple text)
set "INFO=[INFO]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

REM Function to print status info
goto :main

:print_status
echo %INFO% %~1
goto :eof

:print_warning
echo %WARNING% %~1
goto :eof

:print_error
echo %ERROR% %~1
goto :eof

:backup_settings
set "SETTINGS_FILE=%USERPROFILE%\.claude\settings.json"
if exist "%SETTINGS_FILE%" (
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "TIMESTAMP=%dt:~0,8%_%dt:~8,6%"
    copy "%SETTINGS_FILE%" "%SETTINGS_FILE%.backup.%TIMESTAMP%" >nul 2>&1
    call :print_status "Current settings backed up"
)
goto :eof

:update_to_glm
set "SETTINGS_FILE=%USERPROFILE%\.claude\settings.json"
set "SETTINGS_DIR=%USERPROFILE%\.claude"
set "GLM_CONFIG=%SCRIPT_DIR%\glm.ini"

REM Create directory if it doesn't exist
if not exist "%SETTINGS_DIR%" mkdir "%SETTINGS_DIR%"

REM Check if GLM config file exists
if not exist "%GLM_CONFIG%" (
    call :print_error "GLM configuration file not found: %GLM_CONFIG%"
    exit /b 1
)

REM Copy GLM configuration
copy "%GLM_CONFIG%" "%SETTINGS_FILE%" >nul 2>&1
call :print_status "Settings updated to GLM configuration"
goto :eof

:update_to_claude
set "SETTINGS_FILE=%USERPROFILE%\.claude\settings.json"
set "SETTINGS_DIR=%USERPROFILE%\.claude"
set "CLAUDE_CONFIG=%SCRIPT_DIR%\claude.ini"

REM Create directory if it doesn't exist
if not exist "%SETTINGS_DIR%" mkdir "%SETTINGS_DIR%"

REM Check if Claude config file exists
if not exist "%CLAUDE_CONFIG%" (
    call :print_error "Claude configuration file not found: %CLAUDE_CONFIG%"
    exit /b 1
)

REM Copy Claude configuration
copy "%CLAUDE_CONFIG%" "%SETTINGS_FILE%" >nul 2>&1
call :print_status "Settings updated to Claude configuration (empty env)"
goto :eof

:run_claude
set "RESUME_ARG="

REM Check if --resume was passed
:check_args
if "%~1"=="" goto :done_check_args
if "%~1"=="--resume" set "RESUME_ARG=--resume"
shift
goto :check_args

:done_check_args
call :print_status "Starting Claude Code..."
if defined RESUME_ARG (
    claude --dangerously-skip-permissions --resume
) else (
    claude --dangerously-skip-permissions
)
goto :eof

:show_help
echo kbcode - Claude Code Configuration Manager
echo.
echo Usage:
echo   kbcode glm [--resume]     Switch to GLM API configuration and run Claude
echo   kbcode claude [--resume]  Switch to default Claude configuration and run Claude
echo   kbcode help               Show this help message
echo.
echo Examples:
echo   kbcode glm                Use GLM API configuration
echo   kbcode glm --resume       Use GLM API and resume last session
echo   kbcode claude             Use default Claude configuration
echo   kbcode claude --resume    Use default Claude and resume last session
goto :eof

:main
set "COMMAND=%~1"
shift /1

if "%COMMAND%"=="" (
    call :print_error "No command provided"
    echo.
    echo Usage: kbcode {glm^|claude} [--resume]
    echo Use 'kbcode help' for more information
    exit /b 1
)

if /i "%COMMAND%"=="glm" (
    call :print_status "Switching to GLM mode..."
    call :backup_settings
    call :update_to_glm
    call :run_claude %*
    goto :end
)

if /i "%COMMAND%"=="claude" (
    call :print_status "Switching to Claude mode..."
    call :backup_settings
    call :update_to_claude
    call :run_claude %*
    goto :end
)

if /i "%COMMAND%"=="help" (
    call :show_help
    goto :end
)

call :print_error "Unknown command: %COMMAND%"
echo.
echo Usage: kbcode {glm^|claude} [--resume]
echo Use 'kbcode help' for more information
exit /b 1

:end
endlocal