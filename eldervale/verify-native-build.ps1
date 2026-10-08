# Validate local, nonredistributable Genesis build without uploading ROM data.
# Invoke from any directory: powershell -ExecutionPolicy Bypass -File .\eldervale\verify-native-build.ps1
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$rom = Join-Path $root 'rom\sf2.bin'
$built = Join-Path $root 'build\standardbuild-last.bin'
$log = Join-Path $root 'build\output.log'
Write-Host 'Shining Force: The Ancient Seal - Native Build Check'
Write-Host "Repository: $root"
if (!(Test-Path -LiteralPath $rom)) {
    Write-Host 'MISSING: rom/sf2.bin (provide a legitimate compatible US ROM locally).' -ForegroundColor Yellow
    exit 2
}
$inputSize = (Get-Item -LiteralPath $rom).Length
Write-Host "Input ROM: $inputSize bytes"
if ($inputSize -ne 2097152) {
    Write-Warning 'Unexpected input ROM size. Validate US .bin format before splitting.'
}
if (!(Test-Path -LiteralPath $built)) {
    Write-Host 'MISSING: build/standardbuild-last.bin. Run split/split.bat then build/buildstandard.bat.' -ForegroundColor Yellow
    exit 3
}
$size = (Get-Item -LiteralPath $built).Length
Write-Host "Built ROM: $size bytes"
if ($size -ne 4194304) {
    Write-Warning 'Built ROM is not the expected 4 MiB size.'
    exit 4
}
$stream = [System.IO.File]::OpenRead($built)
try {
    [void]$stream.Seek(0x100, [System.IO.SeekOrigin]::Begin)
    $bytes = New-Object byte[] 16
    [void]$stream.Read($bytes, 0, 16)
    $header = [System.Text.Encoding]::ASCII.GetString($bytes)
} finally {
    $stream.Dispose()
}
Write-Host "ROM header at 0x100: $header"
if (!$header.StartsWith('SEGA')) {
    Write-Warning 'Unexpected Sega ROM header. Emulator verification is essential.'
    exit 5
}
if (Test-Path -LiteralPath $log) {
    Write-Host 'Assembler log tail:'
    Get-Content -LiteralPath $log -Tail 8
}
Write-Host 'PASS: ROM file exists, size and basic header checks passed.' -ForegroundColor Green
Write-Host 'NOTE: This is NOT an emulator or 45-minute gameplay test.'
