$ErrorActionPreference = "Stop"
$root = "C:\Users\akshay2007\Downloads\habit tracke pro"
$dest = Join-Path $root ".jdk21"
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }

$url = "https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse"
$zip = Join-Path $root "jdk21.zip"
Write-Output "Downloading JDK 21..."
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
Write-Output "Extracting..."
Expand-Archive -Path $zip -DestinationPath $dest -Force
Remove-Item $zip
$jhome = Get-ChildItem $dest -Directory | Select-Object -First 1
Write-Output ("JAVA_HOME=" + $jhome.FullName)
