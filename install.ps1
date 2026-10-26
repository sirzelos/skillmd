# Install skills + global CLAUDE.md into ~/.claude (Windows PowerShell)
$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$dest = Join-Path $HOME '.claude'
$skillsDest = Join-Path $dest 'skills'
New-Item -ItemType Directory -Force $skillsDest | Out-Null

Get-ChildItem (Join-Path $repo 'skills') -Directory | ForEach-Object {
    $target = Join-Path $skillsDest $_.Name
    if (Test-Path $target) {
        $bak = "$target.bak-$(Get-Date -Format yyyyMMddHHmmss)"
        Move-Item $target $bak
        Write-Host "backup: $bak"
    }
    Copy-Item $_.FullName $target -Recurse
    Write-Host "installed skill: $($_.Name)"
}

$claudeMd = Join-Path $dest 'CLAUDE.md'
if (Test-Path $claudeMd) {
    Copy-Item $claudeMd "$claudeMd.bak-$(Get-Date -Format yyyyMMddHHmmss)"
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
