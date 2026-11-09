Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PSScriptRoot "..\public\logo.png"
if (!(Test-Path $sourcePath)) {
    Write-Error "Source image not found at $sourcePath"
    exit 1
}

$bytes = [System.IO.File]::ReadAllBytes($sourcePath)
$ms = New-Object System.IO.MemoryStream(,$bytes)
$sourceImg = [System.Drawing.Image]::FromStream($ms)
Write-Host "Loaded source image: $($sourceImg.Width)x$($sourceImg.Height)"

function Save-Resized-Image {
    param(
        [System.Drawing.Image]$src,
        [int]$width,
        [int]$height,
        [string]$destPath,
        [bool]$circle = $false,
        [float]$innerScale = 1.0,
        [System.Drawing.Color]$bgColor = [System.Drawing.Color]::Transparent
    )

    $parent = Split-Path -Parent $destPath
    if (!(Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    $destBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($bgColor -ne [System.Drawing.Color]::Transparent) {
        $g.Clear($bgColor)
    } else {
        $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    }

    if ($circle) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $width, $height)
        $g.SetClip($path)
    }

    if ($innerScale -ne 1.0) {
        $w = [int]($width * $innerScale)
        $h = [int]($height * $innerScale)
        $x = [int](($width - $w) / 2)
        $y = [int](($height - $h) / 2)
        $drawRect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
        $g.DrawImage($src, $drawRect, 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel)
    } else {
        $destRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
        $g.DrawImage($src, $destRect, 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel)
    }

    $destBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $destBmp.Dispose()
    Write-Host "Generated: $destPath ($width x $height)"
}

function Save-Splash-Image {
    param(
        [System.Drawing.Image]$src,
        [int]$width,
        [int]$height,
        [string]$destPath
    )

    $parent = Split-Path -Parent $destPath
    if (!(Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    $destBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $g.Clear([System.Drawing.Color]::FromArgb(255, 0, 0, 0)) # Pitch black

    $minDim = [Math]::Min($width, $height)
    $logoSize = [int]($minDim * 0.68)
    $x = [int](($width - $logoSize) / 2)
    $y = [int](($height - $logoSize) / 2)
    $rect = New-Object System.Drawing.Rectangle($x, $y, $logoSize, $logoSize)

    $g.DrawImage($src, $rect, 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel)
    $destBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $destBmp.Dispose()
    Write-Host "Generated Splash: $destPath ($width x $height)"
}

function Save-Notification-Small-Icon {
    param(
        [int]$size,
        [string]$destPath
    )

    $parent = Split-Path -Parent $destPath
    if (!(Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))

    $w = [float]$size
    $s = $w / 100.0

    # Board background (pure white)
    $boardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $clipPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    
    $bx = 18.0 * $s; $by = 18.0 * $s; $bw = 64.0 * $s; $bh = 72.0 * $s; $r = 12.0 * $s
    $clipPath.AddArc($bx, $by, $r, $r, 180, 90)
    $clipPath.AddArc($bx + $bw - $r, $by, $r, $r, 270, 90)
    $clipPath.AddArc($bx + $bw - $r, $by + $bh - $r, $r, $r, 0, 90)
    $clipPath.AddArc($bx, $by + $bh - $r, $r, $r, 90, 90)
    $clipPath.CloseFigure()
    $g.FillPath($boardBrush, $clipPath)

    # Top clip tab
    $clipTab = New-Object System.Drawing.Drawing2D.GraphicsPath
    $tx = 35.0 * $s; $ty = 8.0 * $s; $tw = 30.0 * $s; $th = 16.0 * $s; $tr = 6.0 * $s
    $clipTab.AddArc($tx, $ty, $tr, $tr, 180, 90)
    $clipTab.AddArc($tx + $tw - $tr, $ty, $tr, $tr, 270, 90)
    $clipTab.AddArc($tx + $tw - $tr, $ty + $th - $tr, $tr, $tr, 0, 90)
    $clipTab.AddArc($tx, $ty + $th - $tr, $tr, $tr, 90, 90)
    $clipTab.CloseFigure()
    $g.FillPath($boardBrush, $clipTab)

    # Cutout transparent checkmark in the center
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $transPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(0, 0, 0, 0), [Math]::Max(2.0, 10.0 * $s))
    $transPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $transPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $transPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $chkPts = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(32.0 * $s, 54.0 * $s)),
        (New-Object System.Drawing.PointF(45.0 * $s, 67.0 * $s)),
        (New-Object System.Drawing.PointF(68.0 * $s, 40.0 * $s))
    )
    $g.DrawLines($transPen, $chkPts)

    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $boardBrush.Dispose()
    $transPen.Dispose()
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated Notification Small Icon: $destPath ($size x $size)"
}

$resBase = "C:\Users\akshay2007\Downloads\habit tracke pro\android\app\src\main\res"

Write-Host "--- 1. Generating Public / Web Assets ---"
Save-Resized-Image $sourceImg 1024 1024 "C:\Users\akshay2007\Downloads\habit tracke pro\public\logo.png"

Write-Host "--- 2. Generating Android Launcher Icons (Legacy Square) ---"
Save-Resized-Image $sourceImg 48 48 "$resBase\mipmap-mdpi\ic_launcher.png"
Save-Resized-Image $sourceImg 72 72 "$resBase\mipmap-hdpi\ic_launcher.png"
Save-Resized-Image $sourceImg 96 96 "$resBase\mipmap-xhdpi\ic_launcher.png"
Save-Resized-Image $sourceImg 144 144 "$resBase\mipmap-xxhdpi\ic_launcher.png"
Save-Resized-Image $sourceImg 192 192 "$resBase\mipmap-xxxhdpi\ic_launcher.png"

Write-Host "--- 3. Generating Android Launcher Round Icons (Legacy Round) ---"
Save-Resized-Image $sourceImg 48 48 "$resBase\mipmap-mdpi\ic_launcher_round.png" $true
Save-Resized-Image $sourceImg 72 72 "$resBase\mipmap-hdpi\ic_launcher_round.png" $true
Save-Resized-Image $sourceImg 96 96 "$resBase\mipmap-xhdpi\ic_launcher_round.png" $true
Save-Resized-Image $sourceImg 144 144 "$resBase\mipmap-xxhdpi\ic_launcher_round.png" $true
Save-Resized-Image $sourceImg 192 192 "$resBase\mipmap-xxxhdpi\ic_launcher_round.png" $true

Write-Host "--- 4. Generating Adaptive Launcher Foregrounds ---"
# 108dp canvas with safe zone center
Save-Resized-Image $sourceImg 108 108 "$resBase\mipmap-mdpi\ic_launcher_foreground.png" $false 0.76
Save-Resized-Image $sourceImg 162 162 "$resBase\mipmap-hdpi\ic_launcher_foreground.png" $false 0.76
Save-Resized-Image $sourceImg 216 216 "$resBase\mipmap-xhdpi\ic_launcher_foreground.png" $false 0.76
Save-Resized-Image $sourceImg 324 324 "$resBase\mipmap-xxhdpi\ic_launcher_foreground.png" $false 0.76
Save-Resized-Image $sourceImg 432 432 "$resBase\mipmap-xxxhdpi\ic_launcher_foreground.png" $false 0.76

Write-Host "--- 5. Generating Notification Large Icons (Full Color) ---"
Save-Resized-Image $sourceImg 256 256 "$resBase\drawable\ic_notification_large.png"
Save-Resized-Image $sourceImg 256 256 "$resBase\drawable\ic_launcher.png"
Save-Resized-Image $sourceImg 64 64 "$resBase\drawable-mdpi\ic_notification_large.png"
Save-Resized-Image $sourceImg 128 128 "$resBase\drawable-hdpi\ic_notification_large.png"
Save-Resized-Image $sourceImg 192 192 "$resBase\drawable-xhdpi\ic_notification_large.png"
Save-Resized-Image $sourceImg 256 256 "$resBase\drawable-xxhdpi\ic_notification_large.png"
Save-Resized-Image $sourceImg 384 384 "$resBase\drawable-xxxhdpi\ic_notification_large.png"

Write-Host "--- 6. Notification Small Status Icon is handled by drawable/ic_stat_icon.xml ---"

Write-Host "--- 7. Generating Android Splash Screens ---"
Save-Splash-Image $sourceImg 480 320 "$resBase\drawable\splash.png"
Save-Splash-Image $sourceImg 320 480 "$resBase\drawable-port-mdpi\splash.png"
Save-Splash-Image $sourceImg 480 800 "$resBase\drawable-port-hdpi\splash.png"
Save-Splash-Image $sourceImg 720 1280 "$resBase\drawable-port-xhdpi\splash.png"
Save-Splash-Image $sourceImg 960 1600 "$resBase\drawable-port-xxhdpi\splash.png"
Save-Splash-Image $sourceImg 1280 1920 "$resBase\drawable-port-xxxhdpi\splash.png"
Save-Splash-Image $sourceImg 480 320 "$resBase\drawable-land-mdpi\splash.png"
Save-Splash-Image $sourceImg 800 480 "$resBase\drawable-land-hdpi\splash.png"
Save-Splash-Image $sourceImg 1280 720 "$resBase\drawable-land-xhdpi\splash.png"
Save-Splash-Image $sourceImg 1600 960 "$resBase\drawable-land-xxhdpi\splash.png"
Save-Splash-Image $sourceImg 1920 1280 "$resBase\drawable-land-xxxhdpi\splash.png"

$sourceImg.Dispose()
Write-Host "ALL ICONS AND ASSETS GENERATED SUCCESSFULLY!"
