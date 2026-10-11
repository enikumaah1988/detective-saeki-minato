param([ValidateSet('dev','build','test','install')][string]$Action='dev')
$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $PSScriptRoot
$taskNode=Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
$taskNpm='C:/Users/lemon/.codex/.chatgpt-projects/g-p-6a244918b2988191ac325bc113799e3e/management/tools/npm/package/bin/npm-cli.js'
$env:PATH=(Split-Path -Parent $taskNode)+[IO.Path]::PathSeparator+$env:PATH
Push-Location -LiteralPath $taskRoot
try {
 switch($Action){
  'dev' { & $taskNode node_modules/vite/bin/vite.js --config tools/windows-vite.config.mjs --configLoader native --host 127.0.0.1 --port 5187 --strictPort }
  'build' { & $taskNode $taskNpm run build }
  'test' { & $taskNode --test --test-concurrency=1 'tests/*.test.mjs' }
  'install' { & $taskNode $taskNpm ci --cache (Join-Path $taskRoot 'node_modules/.npm-cache') }
 }
 $taskExit=$LASTEXITCODE
}finally{Pop-Location}
exit $taskExit
