try {
  $r = Invoke-WebRequest -Uri "https://api.adoptium.net/v3/info/available_releases" -UseBasicParsing -TimeoutSec 15
  Write-Output ("NET_OK:" + $r.StatusCode)
} catch {
  Write-Output ("NO_NET:" + $_.Exception.Message)
}
