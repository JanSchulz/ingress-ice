
@echo off
SETLOCAL EnableDelayedExpansion
REM ingress-ice start script by Nikitakun
REM (http://github.com/nibogd/ingress-ice)
REM 
REM From release 2.2 you don't need to edit
REM anything here. Just double-click this 
REM file and follow the instructions

set FILE="%APPDATA%\.ingress_ice"
IF '%1'=='/?' GOTO :help
IF '%1'=='-h' GOTO :help
IF '%1'=='-r' GOTO :reconf
GOTO :check
:check
IF EXIST %FILE% (
	GOTO :start
) else (
	GOTO :config
)
:reconf
echo You are going to reconfigure ingress-ice. Press any key to continue or close this window to exit.
echo.
PAUSE
:config
cls
:config-1
echo Ingress ICE, Automatic screenshooter for ingress intel map
echo Config file not found. We will create one for you now.
echo.
echo Please input values and press [Enter]. 
echo Input nothing and press [Enter] to choose the default, which is written in (brackets).
echo.
PAUSE
cls
:c-link
echo To get your location link:
echo   1) Go to http://ingress.com/intel
echo   2) Scroll the map to your location and zoom
echo   3) Click the [Link] button on the right top of the screen and copy that link
echo   4) [Right mouse click] - [Paste] to paste it into this window
echo.
set /p LINK= Enter your location link and press [Enter]: 
if [!LINK!]==[] (
	echo Cannot be blank
	GOTO :c-link
)
cls
set /p COOKIE= Do you want to login using cookies (advanced users only)? 1 for yes, 0 for no: 
if [!COOKIE!]==[] (
	set COOKIE=0
)
if [!COOKIE!]==[0] (
:c-login
set /p LOGIN= Your Google login: 
:c-passwd
set /p PASSWD= Your Google password: 
if [!PASSWD!]==[] (
	echo Cannot be blank
	GOTO :c-passwd
)
cls
set CVER=1
) 
if [!COOKIE!]==[1] (

:co-login
set /p LOGIN= Your SACSID cookie: 
:co-passwd
set /p PASSWD= Your CSRFToken cookie: 
if [!PASSWD!]==[] (
	echo Cannot be blank
	GOTO :co-passwd
)
cls
set CVER=2
)
set /p DELAY= Delay between screenshots in seconds: (120) 
cls
set /p MIN_LEVEL= Minimal portal level: (1) 
set /p MAX_LEVEL= Maximum portal level: (8) 
cls
set /p WIDTH= Screenshots' width in pixels: (1366) 
set /p HEIGHT= Screenshots' height: (768) 
cls
set /p NUMBER= Number of screenshots to take, '0' for infinity: (0) 
cls
set /p FOLDER= Folder where to save screenshots (with a trailing slash, '.' means current folder): (./) 
cls
set /p IITC= Do you want to inject IITC (white background)? 1 for yes, 0 for no: (0)
cls
set /p TIMESTAMP= Do you want to timestamp your screenshots? 1 for yes, 0 for no: (0)
cls
if [%MIN_LEVEL%]==[] set MIN_LEVEL=1
if [%MAX_LEVEL%]==[] set MAX_LEVEL=8
if [%DELAY%]==[] set DELAY=120
if [%WIDTH%]==[] set WIDTH=1366
if [%HEIGHT%]==[] set HEIGHT=768
if [%NUMBER%]==[] set NUMBER=0
if [%FOLDER%]==[] set FOLDER=./
if [%TIMESTAMP%]==[] set TIMESTAMP=0
if [%IITC%]==[] set IITC=0
echo Portals level from %MIN_LEVEL% to %MAX_LEVEL%
echo Take %NUMBER% (0 = infinity) screenshots %WIDTH% x %HEIGHT% every %DELAY% seconds and save to %FOLDER%
echo.
set /p CORRECT= Press [Enter] if settings entered are correct. Type 'N' and press [Enter] otherwise: 
IF "%CORRECT%" == "N" (
	echo Let's try again...
	goto :config-1
)
IF "%CORRECT%" == "n" (
	echo Let's try again...
	goto :config-1
)
echo %CVER% %LOGIN% !PASSWD! !LINK! %MIN_LEVEL% %MAX_LEVEL% %DELAY% %WIDTH% %HEIGHT% %FOLDER% %NUMBER% %IITC% %TIMESTAMP% > %FILE%
:start
cls
echo Existing config file found (%FILE%). Starting ice...
set /p ARGS=< %FILE%
phantomjs.exe ice.js !ARGS!
pause
goto :eof
:help
echo Ingress ICE, an automated screenshooter for ingress intel map
echo Copyright (c) Nikitakun (github.com/nibogd)
echo.
echo Usage:
echo   ingress-ice.cmd [-r] [-h]
echo.
echo Options:
echo   -r      Overwrite the configuration file with a new one.
echo   -h      Print this help
echo.
echo Please visit http://ingress.divshot.io/ or http://github.com/nibgd/ingress-ice for additional help
:eof
