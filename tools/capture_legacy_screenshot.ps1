param(
  [string]$CasePath = "ECGsim-3.0.1\cases\normal_male.ECGsimcase",
  [string]$OutputPath = "research\legacy-exports\screenshots\normal-male-main-window.png"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class LegacyScreenshotWin32 {
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hwnd, IntPtr hdcBlt, uint nFlags);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
'@

$exe = (Resolve-Path "ECGsim-3.0.1\ECGsim.exe").Path
$case = (Resolve-Path $CasePath).Path
$outputDirectory = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$process = Start-Process -FilePath $exe -WorkingDirectory (Resolve-Path "ECGsim-3.0.1").Path -ArgumentList @($case) -PassThru

try {
  $root = [System.Windows.Automation.AutomationElement]::RootElement
  $main = $null
  for ($i = 0; $i -lt 40 -and -not $main; $i++) {
    Start-Sleep -Milliseconds 500
    $windows = $root.FindAll([System.Windows.Automation.TreeScope]::Children, [System.Windows.Automation.Condition]::TrueCondition)
    foreach ($window in $windows) {
      if ($window.Current.ProcessId -eq $process.Id -and $window.Current.Name -like "ECGSIM*$([System.IO.Path]::GetFileName($case))*") {
        $main = $window
        break
      }
    }
  }

  if (-not $main) {
    throw "Unable to find the ECGSIM main window for $case"
  }

  $handle = [IntPtr]$main.Current.NativeWindowHandle
  [LegacyScreenshotWin32]::ShowWindow($handle, 9) | Out-Null
  Start-Sleep -Seconds 2

  $rect = $main.Current.BoundingRectangle
  $width = [Math]::Max(1, [int]$rect.Width)
  $height = [Math]::Max(1, [int]$rect.Height)
  $bitmap = New-Object System.Drawing.Bitmap($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $hdc = $graphics.GetHdc()
  $ok = [LegacyScreenshotWin32]::PrintWindow($handle, $hdc, 2)
  $graphics.ReleaseHdc($hdc)
  if (-not $ok) {
    throw "PrintWindow failed for $($main.Current.Name)"
  }

  $bitmap.Save((Resolve-Path $outputDirectory).Path + "\" + (Split-Path -Leaf $OutputPath), [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()

  $item = Get-Item $OutputPath
  $hash = Get-FileHash $OutputPath -Algorithm SHA256
  [pscustomobject]@{
    path = $item.FullName
    bytes = $item.Length
    sha256 = $hash.Hash.ToLowerInvariant()
    windowName = $main.Current.Name
    width = $width
    height = $height
  } | ConvertTo-Json
}
finally {
  Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
}
