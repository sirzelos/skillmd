# Install skills + vendor skills + global CLAUDE.md into ~/.claude (Windows PowerShell)
$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$dest = Join-Path $HOME '.claude'
$skillsDest = Join-Path $dest 'skills'
$ts = Get-Date -Format yyyyMMddHHmmss
New-Item -ItemType Directory -Force $skillsDest | Out-Null

# own skills first, then vendor/<source>/<skill>
$dirs = @(Get-ChildItem (Join-Path $repo 'skills') -Directory)
$dirs += Get-ChildItem (Join-Path $repo 'vendor') -Directory | ForEach-Object { Get-ChildItem $_.FullName -Directory }
foreach ($d in $dirs) {
    $target = Join-Path $skillsDest $d.Name
    if (Test-Path $target) {
        Move-Item $target "$target.bak-$ts"
        Write-Host "backup: $target.bak-$ts"
    }
    Copy-Item $d.FullName $target -Recurse
    Write-Host "installed skill: $($d.Name)"
}

$claudeMd = Join-Path $dest 'CLAUDE.md'
if (Test-Path $claudeMd) {
    Copy-Item $claudeMd "$claudeMd.bak-$ts"
    Write-Host "backup: existing CLAUDE.md"
}
Copy-Item (Join-Path $repo 'global\CLAUDE.md') $claudeMd
Write-Host "installed: $claudeMd"

# thai-lease-contract needs the docx npm package
$leaseScripts = Join-Path $skillsDest 'thai-lease-contract\scripts'
if ((Test-Path $leaseScripts) -and (Get-Command npm -ErrorAction SilentlyContinue)) {
    Push-Location $leaseScripts
    npm install --silent
    Pop-Location
} else {
    Write-Host "skip npm install (npm not found) - run 'npm install' in $leaseScripts later"
}
Write-Host "done. restart Claude Code to load the skills."
