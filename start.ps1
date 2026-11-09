param(
  [string]$WebHost = '127.0.0.1',
  [int]$WebPort = 8848,
  [switch]$LocalHome,
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $Name"
  }
}

Require-Command 'cargo'
if (-not $SkipBuild) {
  Require-Command 'npm'
  npm ci --prefix (Join-Path $repoRoot 'web') | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "Web dependency installation failed with exit code $LASTEXITCODE"
  }
  npm -C (Join-Path $repoRoot 'web') run build | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "Web build failed with exit code $LASTEXITCODE"
  }
  cargo build --locked -p niuma-agent --bin niuma-agent | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "牛马Agent build failed with exit code $LASTEXITCODE"
  }
}

if ($LocalHome) {
  $env:NIUMA_HOME = (Join-Path $repoRoot '.niuma-agent')
}

$env:NIUMA_WEB_HOST = $WebHost
$env:NIUMA_WEB_PORT = "$WebPort"
$binary = Join-Path $repoRoot 'target\debug\niuma-agent.exe'
if (-not (Test-Path $binary -PathType Leaf)) {
  throw "Missing $binary; run without -SkipBuild first."
}

Write-Host "[start] 牛马Agent: http://${WebHost}:${WebPort}/"
Write-Host '[start] Press Ctrl+C to stop.'
& $binary
exit $LASTEXITCODE
