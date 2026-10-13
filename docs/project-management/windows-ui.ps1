param(
    [ValidateSet('dev', 'build', 'test', 'install')]
    [string]$Action = 'dev'
)

$ErrorActionPreference = 'Stop'
$taskWorkspace = Split-Path -Parent $PSScriptRoot
$taskUiPath = Join-Path $taskWorkspace 'saeki-ui-windows'
$taskNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$taskNpm = Join-Path $PSScriptRoot 'tools\npm\package\bin\npm-cli.js'
if (!(Test-Path -LiteralPath $taskNode) -or !(Test-Path -LiteralPath $taskNpm)) {
    throw 'Node/npm not found. See the Windows development guide in management.'
}
$env:PATH = (Split-Path -Parent $taskNode) + [IO.Path]::PathSeparator + $env:PATH
Push-Location -LiteralPath $taskUiPath
try {
    switch ($Action) {
        'dev' { & $taskNode $taskNpm run dev -- --host 127.0.0.1 --port 5186 --strictPort }
        'build' { & $taskNode $taskNpm run build }
        'test' { & $taskNode --test --test-isolation=none 'tests/*.test.mjs' }
        'install' { & $taskNode $taskNpm ci --cache (Join-Path $PSScriptRoot 'tools\npm-cache') }
    }
    $taskExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $taskExitCode
