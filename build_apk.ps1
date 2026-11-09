$ErrorActionPreference = "Stop"
$root = "C:\Users\akshay2007\Downloads\habit tracke pro"
$env:JAVA_HOME = Join-Path $root ".jdk21\jdk-21.0.11+10"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
Set-Location (Join-Path $root "android")
& ".\gradlew.bat" assembleDebug --console=plain
