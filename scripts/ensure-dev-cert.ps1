$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$certDir = Join-Path $repoRoot ".certs"
$pfxPath = Join-Path $certDir "dev-https.pfx"
$cerPath = Join-Path $certDir "dev-https.cer"

if ((Test-Path $pfxPath) -and (Test-Path $cerPath)) {
  exit 0
}

New-Item -ItemType Directory -Force -Path $certDir | Out-Null

$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.IPAddress -and
    $_.IPAddress -ne "127.0.0.1" -and
    $_.IPAddress -notlike "169.254.*" -and
    $_.InterfaceAlias -notlike "*Loopback*"
  } |
  Select-Object -ExpandProperty IPAddress -Unique

$sanParts = @(
  "dns=localhost",
  "dns=habit-tracker-pro.local",
  "ipaddress=127.0.0.1",
  "ipaddress=::1"
)

foreach ($ip in $ipAddresses) {
  if ($ip -and $ip -notlike "127.*") {
    $sanParts += "ipaddress=$ip"
  }
}

$sanExtension = "2.5.29.17={text}" + ($sanParts -join "&")
$textExtensions = @(
  "2.5.29.37={text}1.3.6.1.5.5.7.3.1",
  $sanExtension
)
$certPassphrase = "habit-tracker-pro-dev"

$certificate = New-SelfSignedCertificate `
  -Type Custom `
  -Subject "CN=habit-tracker-pro.local" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -KeyExportPolicy Exportable `
  -KeyAlgorithm RSA `
  -KeyLength 2048 `
  -HashAlgorithm SHA256 `
  -KeyUsage DigitalSignature, KeyEncipherment `
  -NotAfter (Get-Date).AddYears(5) `
  -TextExtension $textExtensions

$securePassword = ConvertTo-SecureString -String $certPassphrase -AsPlainText -Force
Export-PfxCertificate -Cert $certificate -FilePath $pfxPath -Password $securePassword | Out-Null
Export-Certificate -Cert $certificate -FilePath $cerPath | Out-Null
