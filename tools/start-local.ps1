param([ValidateRange(1, 65535)][int]$Port = 5187)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskNpm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $taskNpm) {
    Write-Host 'Node.js and npm are required. Install Node.js, then run this script again.'
    exit 1
}
Push-Location -LiteralPath $taskRoot
try {
    if (-not (Test-Path -LiteralPath 'node_modules/vite/bin/vite.js')) {
        & $taskNpm.Source ci
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    Write-Host "Open http://127.0.0.1:$Port/ in your browser. Press Ctrl+C to stop."
    & $taskNpm.Source run dev -- --host 127.0.0.1 --port $Port --strictPort
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
