# Source-only checks for the native Shining Force: The Ancient Seal intro.
# Requires NO copyrighted ROM data. Run from any location.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$introPath = Join-Path $root 'disasm\data\scripting\introtext-standard.asm'
$patchPath = Join-Path $root 'disasm\sf2patches.asm'
$intro = Get-Content -LiteralPath $introPath
$errorsFound = @()
$lineCount = 0
foreach ($line in $intro) {
    if ($line -match "dc\.b\s+(\d+),'([^']*)',0") {
        $start = [int]$Matches[1]
        $message = $Matches[2]
        $lineCount++
        if (($start + $message.Length) -gt 32) {
            $errorsFound += "Intro line overruns column 32: $message"
        }
        if ($message -cnotmatch '^[A-Z0-9 ,.\-!?:]+$') {
            $errorsFound += "Unsupported character in intro: $message"
        }
    }
}
$source = Get-Content -LiteralPath $introPath -Raw
$patch = Get-Content -LiteralPath $patchPath -Raw
if ($lineCount -lt 10) { $errorsFound += 'Expected at least 10 scrolling intro text lines.' }
if ($source -notmatch "SHINING FORCE" -or $source -notmatch "THE ANCIENT SEAL") {
    $errorsFound += 'Missing canonical title in introduction.'
}
if ($source -match 'ELDERVALE') { $errorsFound += 'Legacy title remains in introduction.' }
if ($source -match "dc\.b\s+\d+,'[^']*LEMON") {
    $errorsFound += 'The former sword owner must remain undisclosed.'
}
if ($patch -notmatch 'SCROLLING_TEXT_INTRODUCTION:\s+equ\s+1') {
    $errorsFound += 'Native scrolling text intro patch is not enabled.'
}
if ($errorsFound.Count -gt 0) {
    foreach ($problem in $errorsFound) { Write-Error $problem }
    exit 1
}
Write-Host "PASS: $lineCount scrolling intro lines fit 32 columns; title, mystery and native patch checks passed." -ForegroundColor Green
Write-Host 'NOTE: Static checks only; build and emulator playtests still required.'
