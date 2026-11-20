# lipnardo -- Interactive Installer (Windows PowerShell)
# Symlinks the skill into $env:USERPROFILE\.claude\skills\ and optionally writes the API key.
# Requires Developer Mode enabled OR running as Administrator (for symlinks).

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsDir = Join-Path $ScriptDir "skills"
$TargetDir = Join-Path $env:USERPROFILE ".claude\skills"
$HeyGenDir = Join-Path $env:USERPROFILE ".heygen"
$ConfigPath = Join-Path $HeyGenDir "config.json"
$OutputDir = Join-Path $env:USERPROFILE "Documents\lipnardo_videos"

function Write-Step($num, $msg) { Write-Host "`n[$num] $msg" -ForegroundColor Blue }
function Write-Ok($msg)         { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn2($msg)      { Write-Host "  [!] $msg" -ForegroundColor Yellow }
function Write-Err($msg)        { Write-Host "  [ERROR] $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "  ================================================================" -ForegroundColor White
Write-Host "      lipnardo -- HeyGen Avatar Video Generation for Claude Code" -ForegroundColor White
Write-Host "  ================================================================" -ForegroundColor White
Write-Host ""
Write-Host "  This installer will set up everything you need."
Write-Host "  Note: symlinks require Developer Mode OR running as Administrator."
Write-Host ""

# ──────────────────────────────────────────────────────────────────────
# Step 1: Prerequisites
# ──────────────────────────────────────────────────────────────────────
Write-Step "1/4" "Checking your system..."

if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Ok "git found"
} else {
    Write-Err "git not found. Install from https://git-scm.com/download/win"
    exit 1
}

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python3 -ErrorAction SilentlyContinue }
if ($python) {
    $pyVersion = & $python.Source --version 2>&1
    Write-Ok "Python: $pyVersion"
} else {
    Write-Err "Python 3.8+ not found. Install from https://python.org"
    exit 1
}

if (Get-Command claude -ErrorAction SilentlyContinue) {
    Write-Ok "Claude Code CLI found"
} else {
    Write-Warn2 "Claude Code CLI not detected."
    Write-Host "         That's fine if you use the VS Code / JetBrains extension or desktop app."
    Write-Host "         To install: https://claude.com/claude-code"
}

# ──────────────────────────────────────────────────────────────────────
# Step 2: API key
# ──────────────────────────────────────────────────────────────────────
Write-Step "2/4" "HeyGen API key setup..."

if ($env:HEYGEN_API_KEY) {
    Write-Ok "HEYGEN_API_KEY environment variable is set"
} elseif (Test-Path $ConfigPath) {
    Write-Ok "Existing config found at $ConfigPath"
} else {
    Write-Host ""
    Write-Host "  Get your key from: https://app.heygen.com/settings/api"
    Write-Host "  (Free signup, `$5 minimum balance for first paid generation)"
    Write-Host ""
    $key = Read-Host "  Paste your HeyGen API key now (or press Enter to skip)"
    if ($key) {
        if (-not (Test-Path $HeyGenDir)) {
            New-Item -ItemType Directory -Path $HeyGenDir -Force | Out-Null
        }
        $config = @{ api_key = $key } | ConvertTo-Json
        Set-Content -Path $ConfigPath -Value $config -NoNewline
        # Restrict ACL to current user only
        $acl = Get-Acl $ConfigPath
        $acl.SetAccessRuleProtection($true, $false)
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $env:USERNAME, "FullControl", "Allow")
        $acl.SetAccessRule($rule)
        Set-Acl -Path $ConfigPath -AclObject $acl
        Write-Ok "API key saved to $ConfigPath (current user only)"
    } else {
        Write-Warn2 "Skipped. Set HEYGEN_API_KEY env var before running the skill."
    }
}

# ──────────────────────────────────────────────────────────────────────
# Step 3: Install skill (symlink)
# ──────────────────────────────────────────────────────────────────────
Write-Step "3/4" "Installing Claude Code skill..."

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}

$skillSrc = Join-Path $SkillsDir "lipnardo"
$skillTarget = Join-Path $TargetDir "lipnardo"

if (-not (Test-Path $skillSrc)) {
    Write-Err "Skill source not found at $skillSrc"
    exit 1
}

if (Test-Path $skillTarget) {
    $item = Get-Item $skillTarget
    if ($item.LinkType -eq "SymbolicLink") {
        Remove-Item $skillTarget -Force
    } else {
        $backup = "$skillTarget.backup.$(Get-Date -Format yyyyMMddHHmmss)"
        Move-Item $skillTarget $backup
        Write-Warn2 "Existing installation moved to $backup"
    }
}

try {
    New-Item -ItemType SymbolicLink -Path $skillTarget -Target $skillSrc -Force | Out-Null
    Write-Ok "Skill linked: $skillTarget -> $skillSrc"
} catch {
    Write-Err "Symlink failed. Enable Developer Mode (Settings -> Update & Security -> For Developers) or run as Administrator."
    Write-Host "         Falling back to copy..."
    Copy-Item -Path $skillSrc -Destination $skillTarget -Recurse -Force
    Write-Ok "Skill copied to: $skillTarget"
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}
Write-Ok "Output folder: $OutputDir"

# ──────────────────────────────────────────────────────────────────────
# Step 4: Verify
# ──────────────────────────────────────────────────────────────────────
Write-Step "4/4" "Verifying installation..."

if (Test-Path $skillTarget) {
    Write-Ok "Skill installed"
} else {
    Write-Err "Skill installation failed"
    exit 1
}

Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "      Installation Complete!" -ForegroundColor Green
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Your videos will be saved to: $OutputDir"
Write-Host ""
Write-Host "  How to use:" -ForegroundColor White
Write-Host "  Open Claude Code and type any of these:"
Write-Host ""
Write-Host "    `"Generate a 30-second avatar video saying: Welcome to Acme`""
Write-Host "    `"/lipnardo generate --prompt 'A professional explaining quarterly results'`""
Write-Host "    `"/lipnardo credits`""
Write-Host "    `"/lipnardo setup`""
Write-Host ""
Write-Host "  First-time tip: use --test true for free watermarked iterations." -ForegroundColor White
Write-Host ""
Write-Host "  To uninstall: powershell -ExecutionPolicy Bypass -File $ScriptDir\uninstall.ps1" -ForegroundColor White
Write-Host ""
