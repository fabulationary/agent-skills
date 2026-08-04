@echo off
REM ===================================================================
REM  NEON ELEVATION - Windows launcher
REM
REM  Double-click this file. It checks your Node install, installs
REM  dependencies the first time, starts the dev server in its own
REM  window, and opens the game in a phone-shaped browser window.
REM
REM  To stop the game: close the "NEON ELEVATION server" window.
REM ===================================================================

setlocal EnableDelayedExpansion
title NEON ELEVATION - launcher
cd /d "%~dp0"

set "PORT=5173"
set "URL=http://127.0.0.1:%PORT%/"

REM Window is an exact x3 of the 180px logical width, so pixel art scales
REM cleanly. Non-integer scaling is the one thing that ruins this art style.
set "WINW=540"
set "WINH=960"

echo.
echo   NEON ELEVATION - Act I vertical slice
echo   ====================================
echo.

REM --- 1. Is Node installed? -----------------------------------------
where node >nul 2>&1
if errorlevel 1 (
    echo   [X] Node.js was not found on your PATH.
    echo.
    echo       Install the LTS build from https://nodejs.org
    echo       then close this window and run play.bat again.
    echo.
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%v in ('node -v') do set "NODEMAJOR=%%v"
set "NODEMAJOR=!NODEMAJOR:v=!"

if !NODEMAJOR! LSS 20 (
    echo   [X] Node !NODEMAJOR! is too old - this needs Node 20 or newer.
    echo       Update from https://nodejs.org and try again.
    echo.
    pause
    exit /b 1
)

echo   Node !NODEMAJOR! - OK
if !NODEMAJOR! LSS 22 (
    echo   Note: "npm run balance" needs Node 22+. The game itself is fine.
)

REM --- 2. Dependencies ----------------------------------------------
if not exist "node_modules\" (
    echo.
    echo   First run - installing dependencies. This takes about 30 seconds
    echo   and only happens once.
    echo.
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo.
        echo   [X] npm install failed. Scroll up for the reason.
        echo.
        pause
        exit /b 1
    )
)

REM --- 3. Start the dev server in its own window ---------------------
REM --strictPort so it fails loudly instead of quietly moving to 5174,
REM which would leave us opening a browser at the wrong address.
echo.
echo   Starting dev server on port %PORT% ...
start "NEON ELEVATION server" cmd /k "npm run dev -- --port %PORT% --strictPort"

REM --- 4. Wait until it actually answers -----------------------------
set "HAVECURL=1"
where curl >nul 2>&1
if errorlevel 1 set "HAVECURL=0"

if "%HAVECURL%"=="0" (
    echo   Waiting 6 seconds for it to boot ...
    timeout /t 6 /nobreak >nul
    goto :launch
)

set /a TRIES=0
:waitloop
set /a TRIES+=1
curl -s -o nul "%URL%" >nul 2>&1
if not errorlevel 1 goto :launch
if !TRIES! GEQ 30 (
    echo.
    echo   [!] The server did not answer after 30 seconds.
    echo       Check the "NEON ELEVATION server" window for the error.
    echo       The most common cause is port %PORT% already being in use.
    echo.
    pause
    exit /b 1
)
timeout /t 1 /nobreak >nul
goto :waitloop

REM --- 5. Open a phone-shaped window ---------------------------------
:launch
REM %ProgramFiles(x86)% contains a bracket, which breaks batch parsing
REM inside parenthesised blocks. Copy it out first and use the copy.
set "PF=%ProgramFiles%"
set "PFX86=%ProgramFiles(x86)%"
set "BROWSER="

if exist "%PF%\Google\Chrome\Application\chrome.exe" set "BROWSER=%PF%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%PFX86%\Google\Chrome\Application\chrome.exe" set "BROWSER=%PFX86%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "BROWSER=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%PF%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%PF%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%PFX86%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%PFX86%\Microsoft\Edge\Application\msedge.exe"

if defined BROWSER (
    REM A dedicated profile directory forces a fresh browser instance, which
    REM is the only way --window-size is honoured when the browser is already
    REM running. It also means your saved run persists between launches.
    start "" "%BROWSER%" ^
        --app=%URL% ^
        --window-size=%WINW%,%WINH% ^
        --window-position=60,40 ^
        --user-data-dir="%TEMP%\neon-elevation-profile"
) else (
    echo   No Chrome or Edge found - opening your default browser.
    echo   Narrow the window to about %WINW%x%WINH% for the intended look.
    start "" "%URL%"
)

REM --- 6. Tell the player how to actually play -----------------------
cls
echo.
echo   NEON ELEVATION is running at %URL%
echo.
echo   CONTROLS
echo     WASD / arrows .... move and attack
echo     Q E Z C .......... diagonals
echo     .  ............... wait one turn
echo     ^>  ............... ascend (while standing on the lift)
echo     Esc .............. cancel targeting / close a panel
echo.
echo     Click a tile to path there. Click an action slot, then a target.
echo     Click yourself to wait, or to use the tile you are standing on.
echo.
echo   THE ONE RULE THAT MATTERS
echo     Standing still is what kills you. The TRACE bar across the top
echo     fills every turn. At 95 the station releases a Hunter-Killer,
echo     and it moves exactly as fast as you do.
echo.
echo   TO STOP
echo     Close the "NEON ELEVATION server" window, or press Ctrl+C in it.
echo.
echo   OTHER COMMANDS (run from this folder)
echo     npm test        49 unit tests
echo     npm run balance 250 headless bot runs + balance report
echo     npm run build   typecheck and bundle to dist\
echo.
pause
endlocal
