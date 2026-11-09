$ErrorActionPreference = "Stop"

$api = "https://api.adoptium.net/v3/assets/latest/21/hotspot?architecture=x64&heap_size=normal&image_type=jdk&os=windows&vendor=eclipse"
$asset = (Invoke-RestMethod $api)[0]

if (-not $asset) {
  throw "No JDK 21 asset returned by Adoptium."
}

$package = $asset.binary.package
$packageName = $package.name
$packageLink = $package.link
$destination = "C:\tmp\jdk21"

New-Item -ItemType Directory -Path $destination -Force | Out-Null

$archivePath = Join-Path $destination $packageName
Invoke-WebRequest -Uri $packageLink -OutFile $archivePath

if ($packageName.EndsWith(".zip")) {
  Expand-Archive -Path $archivePath -DestinationPath $destination -Force
} elseif ($packageName.EndsWith(".msi")) {
  Start-Process -FilePath "msiexec.exe" -Wait -ArgumentList "/a", $archivePath, "/qn", "TARGETDIR=$destination"
} else {
  throw "Unsupported package type: $packageName"
}

$javaExe = Get-ChildItem -Path $destination -Recurse -Filter "java.exe" -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $javaExe) {
  throw "java.exe not found after extracting the JDK package."
}

$javaExe.FullName
