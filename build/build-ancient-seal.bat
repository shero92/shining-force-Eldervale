@echo off
setlocal EnableExtensions
rem Build a playable Shining Force II ROM using the modified disassembly.
rem Run this script from any working directory on Windows.
cd /d "%~dp0"
set "ROOT=%CD%\.."
set "SOURCE=%ROOT%\rom\sf2.bin"
set "UPLOADED=%ROOT%\rom\Shining_Force_II_(U)_[!].bin"
if not exist "%SOURCE%" (
  if exist "%UPLOADED%" (
    copy /b "%UPLOADED%" "%SOURCE%" >nul
  ) else (
    echo ERROR: Place your legally obtained US ROM at rom\sf2.bin.
    exit /b 1
  )
)
for %%F in ("%SOURCE%") do if not "%%~zF"=="2097152" (
  echo ERROR: Expected a 2,097,152-byte US ROM.
  exit /b 1
)
echo Splitting ROM into assembly input assets...
pushd "%ROOT%\split"
echo.|call split.bat
if errorlevel 1 (
  popd
  echo ERROR: Split operation failed.
  exit /b 1
)
popd
echo Building modified standard ROM...
pushd "%ROOT%\build"
echo.|call buildstandard.bat
if errorlevel 1 (
  popd
  echo ERROR: ROM build returned an error.
  exit /b 1
)
if not exist "standardbuild-last.bin" (
  popd
  echo ERROR: No ROM output found. Inspect build\output.log.
  exit /b 1
)
copy /b "standardbuild-last.bin" "ancient-seal-playtest.bin" >nul
if errorlevel 1 (
  popd
  echo ERROR: Failed to copy ROM output.
  exit /b 1
)
popd
echo Done: build\ancient-seal-playtest.bin
exit /b 0
