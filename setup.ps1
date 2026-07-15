#Requires -Version 5.1
<#
  Vibecoder Discord Presence - one-line setup for Claude Code (Windows).

    irm https://raw.githubusercontent.com/ivanreeve/vibecoder-discord-presence/master/setup.ps1 | iex

  Clones (or updates) this fork, builds it, registers the Claude Code hooks, and
  installs the dynamic "developer" preset - a live readout of the model and
  reasoning effort you're actually running (e.g. "Using Opus 4.8 (Max)").

  Safe to re-run: any existing presence config is backed up before it's replaced.
  Needs Node 18+, npm, and git, plus the Discord desktop app running.

  Environment overrides:
    VDP_REPO           git URL to clone            (default: the ivanreeve fork)
    VDP_BRANCH         branch to check out         (default: master)
    VDP_HOME           where to install the tool   (default: ~\.vibecoder-discord-presence)
    CLAUDE_CONFIG_DIR  Claude Code config dir      (default: ~\.claude; honored by vdp too)
#>

# Keep native (git/npm) stderr from throwing on PowerShell 7.4+, where it can be
# treated as terminating. We gate every native call on its exit code instead.
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -Scope Global -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

$repo       = if ($env:VDP_REPO)          { $env:VDP_REPO }          else { 'https://github.com/ivanreeve/vibecoder-discord-presence.git' }
$branch     = if ($env:VDP_BRANCH)        { $env:VDP_BRANCH }        else { 'master' }
$installDir = if ($env:VDP_HOME)          { $env:VDP_HOME }          else { Join-Path $HOME '.vibecoder-discord-presence' }
$claudeDir  = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' }
$configDest = Join-Path $claudeDir 'discord-presence\config.json'

function Step($m) { Write-Host "==> $m" -ForegroundColor Green }
function Warn($m) { Write-Host "!   $m" -ForegroundColor Yellow }
function Die($m)  { Write-Host "error: $m" -ForegroundColor Red; exit 1 }
function Need($exe, $hint) {
  if (-not (Get-Command $exe -ErrorAction SilentlyContinue)) { Die "$exe is required. $hint" }
}
# Invoke a native command and abort if it returns non-zero.
function Run($exe, [string[]]$argList) {
  & $exe @argList
  if ($LASTEXITCODE -ne 0) { Die "'$exe $($argList -join ' ')' failed (exit $LASTEXITCODE)" }
}

try {
  # Guard against a footgun VDP_HOME (we may rm -rf it on a fresh clone).
  if ([string]::IsNullOrWhiteSpace($installDir) -or $installDir -eq $HOME -or $installDir -match '^[A-Za-z]:\\?$') {
    Die "refusing to use '$installDir' as the install dir; set VDP_HOME to a dedicated folder."
  }

  Step 'Checking prerequisites'
  Need 'git'  'Install from https://git-scm.com'
  Need 'node' 'Install Node 18+ from https://nodejs.org'
  Need 'npm'  'It ships with Node.js'
  $nodeMajor = [int](node -p 'process.versions.node.split(".")[0]')
  if ($nodeMajor -lt 18) { Die "Node.js 18+ required; found $(node -v)" }
  Write-Host "    node $(node -v), $(git --version)" -ForegroundColor DarkGray

  if (Test-Path (Join-Path $installDir '.git')) {
    Step "Updating existing install at $installDir"
    Run 'git' @('-C', $installDir, 'fetch', '--quiet', '--depth', '1', 'origin', $branch)
    Run 'git' @('-C', $installDir, 'checkout', '--quiet', '-B', $branch, "origin/$branch")
    Run 'git' @('-C', $installDir, 'reset', '--hard', '--quiet', "origin/$branch")
  }
  else {
    Step "Cloning $repo"
    if (Test-Path $installDir) { Remove-Item -Recurse -Force $installDir -ErrorAction Stop }
    Run 'git' @('clone', '--quiet', '--branch', $branch, '--depth', '1', $repo, $installDir)
  }

  Push-Location $installDir
  try {
    Step 'Installing dependencies (this can take a minute)'
    Run 'npm' @('install', '--include=dev', '--no-fund', '--no-audit', '--loglevel=error')
    Step 'Building'
    Run 'npm' @('run', 'build', '--silent')
  }
  finally {
    Pop-Location
  }

  $entry = Join-Path $installDir 'dist\vdp.js'
  if (-not (Test-Path $entry)) { Die 'build did not produce dist\vdp.js' }

  Step 'Registering Claude Code hooks'
  Run 'node' @($entry, 'install')

  $preset = Join-Path $installDir 'presets\developer.json'
  if (Test-Path $preset) {
    New-Item -ItemType Directory -Force (Split-Path $configDest) -ErrorAction Stop | Out-Null
    if ((Test-Path $configDest) -and ((Get-FileHash $preset).Hash -ne (Get-FileHash $configDest).Hash)) {
      $backup = "$configDest.$(Get-Date -Format 'yyyyMMdd-HHmmss').bak"
      Copy-Item $configDest $backup -ErrorAction Stop
      Warn "existing config backed up -> $backup"
    }
    Copy-Item $preset $configDest -Force -ErrorAction Stop
    Write-Host "    preset installed -> $configDest" -ForegroundColor DarkGray
  }
  else {
    Warn "preset not found at $preset - kept the default config"
  }

  Step 'Done!'
  Write-Host ''
  Write-Host '  Your presence uses the developer theme with a live model + effort readout, e.g.'
  Write-Host '    Editing index.ts - Using Opus 4.8 (Max)' -ForegroundColor DarkGray
  Write-Host ''
  Write-Host '  Next:'
  Write-Host '    1. Make sure the Discord desktop app is running.'
  Write-Host '    2. Open Claude Code - your status appears on its own.'
  Write-Host ''
  Write-Host "  Customize:  node `"$entry`" config"
  Write-Host "  Uninstall:  node `"$entry`" uninstall --purge"
}
catch {
  Die $_.Exception.Message
}
