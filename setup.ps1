param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))
$ErrorActionPreference = 'Stop'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw '需要 Node.js 22.12+，请先安装并加入 PATH。' }
node -e 'const [a,b]=process.versions.node.split(".").map(Number); if(a<22 || (a===22 && b<12)) process.exit(1)'
if ($LASTEXITCODE -ne 0) { throw '需要 Node.js 22.12 或更高版本。' }
$pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue
$bundledPnpm = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pnpm/bin/pnpm.cjs'
$projectPath = [IO.Path]::GetFullPath($ProjectRoot)
if (-not (Test-Path -LiteralPath (Join-Path $projectPath 'package.json'))) { throw '请先在目标项目根目录创建 package.json，再传入 -ProjectRoot；不会在技能目录安装依赖。' }
$projectPackage = Get-Content -LiteralPath (Join-Path $projectPath 'package.json') -Raw | ConvertFrom-Json
$dependencySpec = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'DEPENDENCIES.json') -Raw | ConvertFrom-Json
$wantedVersion = $dependencySpec.packages.'puppeteer-core'
$installArgs = @('add','--save-exact',('puppeteer-core@'+$wantedVersion))
if ($projectPackage.dependencies.'puppeteer-core' -eq $wantedVersion -and (Test-Path -LiteralPath (Join-Path $projectPath 'pnpm-lock.yaml'))) { $installArgs = @('install','--frozen-lockfile') }
Push-Location $projectPath
try {
  if ($pnpmCommand) { & $pnpmCommand.Source @installArgs }
  elseif (Test-Path -LiteralPath $bundledPnpm) { node $bundledPnpm @installArgs }
  else { throw '需要 pnpm。安装 pnpm 后重新执行本脚本。' }
  if ($LASTEXITCODE -ne 0) { throw '依赖安装失败' }
} finally { Pop-Location }
