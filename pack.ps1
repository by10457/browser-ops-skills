param([Parameter(Mandatory=$true)][string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
$destination = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$stage = Join-Path $destination ('browser-skills-' + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $stage | Out-Null
foreach ($file in @('DEPENDENCIES.json','setup.ps1','pack.ps1','DISTRIBUTION.md')) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination $stage
}
foreach ($skill in @('bitbrowser','huyou')) {
    $target = Join-Path $stage $skill
    New-Item -ItemType Directory -Path $target | Out-Null
    foreach ($entry in @('SKILL.md','package.json','scripts','references','examples','agents','tests')) {
        $source = Join-Path (Join-Path $PSScriptRoot $skill) $entry
        if (Test-Path -LiteralPath $source) { Copy-Item -LiteralPath $source -Destination $target -Recurse }
    }
}
$archive = $stage + '.zip'
Compress-Archive -LiteralPath $stage -DestinationPath $archive
Write-Output $archive
