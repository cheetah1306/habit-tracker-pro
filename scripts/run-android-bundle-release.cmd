@echo off
setlocal
cd /d C:\Users\akshay2007\Downloads\HABITT~1
set "JAVA_HOME=C:\Users\akshay2007\.android\cli\bundles\17d6e0ca5f18b7c0be42a3627309b2dfec69e58f\jre"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd android
call .\gradlew.bat bundleRelease
