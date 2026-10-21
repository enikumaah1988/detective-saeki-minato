param(
    [ValidateRange(1, 65535)][int]$Port = 5187,
    [ValidateSet('start', 'status', 'stop')][string]$Action = 'start'
)
$ErrorActionPreference = 'Stop'
$taskNode = Get-Command node -ErrorAction SilentlyContinue
if (-not $taskNode) {
    Write-Host 'Node.js and npm are required. Install Node.js, then run this script again.'
    exit 1
}
& $taskNode.Source (Join-Path $PSScriptRoot 'local-server.mjs') $Action $Port
exit $LASTEXITCODE
