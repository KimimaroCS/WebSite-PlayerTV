#Requires -Version 5.1
<#
.SYNOPSIS
  FaceitEsportDiag — collecteur hardware / OS / display / GPU / net / CS2 pour diag esport FACEIT.
.NOTES
  Lecture seule. Aucune modification système. Exécuter en Admin recommandé (TPM / Secure Boot / drivers).
  Usage:
    PowerShell (Admin) :
      Set-ExecutionPolicy -Scope Process Bypass -Force
      cd $env:USERPROFILE\Downloads
      .\FaceitEsportDiag.ps1
#>

$ErrorActionPreference = 'SilentlyContinue'
$ProgressPreference = 'SilentlyContinue'
$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

function Section([string]$Title) {
  "`r`n==== $Title ===="
}

function KV([string]$K, $V) {
  if ($null -eq $V -or ($V -is [string] -and [string]::IsNullOrWhiteSpace($V))) { $V = 'N/A' }
  if ($V -is [bool]) { $V = if ($V) { 'Yes' } else { 'No' } }
  '{0,-34}: {1}' -f $K, $V
}

function Try-Cmd([scriptblock]$Block) {
  try { & $Block } catch { $null }
}

$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$outDir = Join-Path $env:USERPROFILE 'Desktop'
if (-not (Test-Path $outDir)) { $outDir = $env:USERPROFILE }
$outFile = Join-Path $outDir "FaceitEsportDiag_$stamp.txt"

$sb = New-Object System.Text.StringBuilder
function Out([string]$Line = '') { [void]$sb.AppendLine($Line) }

Out 'FACEIT ESPORT DIAG — READ-ONLY SNAPSHOT'
Out ("Generated : {0}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
Out ("Host      : {0}" -f $env:COMPUTERNAME)
Out ("User      : {0}" -f $env:USERNAME)
Out ("Admin     : {0}" -f ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))
Out ("PSVersion : {0}" -f $PSVersionTable.PSVersion)

# --- OS ---
Out (Section 'OS / BUILD')
$os = Get-CimInstance Win32_OperatingSystem
$cs = Get-CimInstance Win32_ComputerSystem
Out (KV 'Caption' $os.Caption)
Out (KV 'Version' $os.Version)
Out (KV 'Build' $os.BuildNumber)
Out (KV 'DisplayVersion' (Try-Cmd { (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion').DisplayVersion }))
Out (KV 'UBR' (Try-Cmd { (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion').UBR }))
Out (KV 'InstallDate' $os.InstallDate)
Out (KV 'LastBoot' $os.LastBootUpTime)
Out (KV 'SystemType' $os.OSArchitecture)
Out (KV 'Manufacturer' $cs.Manufacturer)
Out (KV 'Model' $cs.Model)

# --- FACEIT security posture ---
Out (Section 'FACEIT SECURITY POSTURE')
$secureBoot = Try-Cmd { Confirm-SecureBootUEFI }
Out (KV 'SecureBoot' $secureBoot)

$biosMode = Try-Cmd {
  $t = bcdedit /enum firmware 2>$null
  'UEFI-check via msinfo proxy'
}
$firmwareType = Try-Cmd { (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control').PEFirmwareType }
Out (KV 'PEFirmwareType(1=BIOS,2=UEFI)' $firmwareType)

$tpm = Try-Cmd { Get-Tpm }
if ($tpm) {
  Out (KV 'TPM Present' $tpm.TpmPresent)
  Out (KV 'TPM Ready' $tpm.TpmReady)
  Out (KV 'TPM Enabled' $tpm.TpmEnabled)
  Out (KV 'TPM Activated' $tpm.TpmActivated)
} else {
  Out (KV 'TPM' 'Get-Tpm unavailable (run as Admin)')
}

$vbs = Try-Cmd { (Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard) }
if ($vbs) {
  Out (KV 'SecurityServicesRunning' (($vbs.SecurityServicesRunning) -join ','))
  Out (KV 'VirtualizationBasedSecurityStatus' $vbs.VirtualizationBasedSecurityStatus)
  Out (KV 'CodeIntegrityPolicyEnforcementStatus' $vbs.CodeIntegrityPolicyEnforcementStatus)
}

$hvci = Try-Cmd { (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity' -ErrorAction SilentlyContinue).Enabled }
Out (KV 'HVCI/MemoryIntegrity Enabled' $hvci)

$iommu = Try-Cmd { (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management' -ErrorAction SilentlyContinue).EnableDmaProtection }
Out (KV 'KernelDMAProtection' (Try-Cmd { (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard' -ErrorAction SilentlyContinue).EnableVirtualizationBasedSecurity }))

$wu = Try-Cmd { (New-Object -ComObject Microsoft.Update.AutoUpdate).Results.LastInstallationSuccessDate }
Out (KV 'WU LastSuccess' $wu)
$wuPause = Try-Cmd { (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings' -ErrorAction SilentlyContinue).PauseUpdatesExpiryTime }
Out (KV 'WU PauseExpiry' $wuPause)

# Device Guard / Credential Guard summary via msinfo fields
$dg = Try-Cmd { Get-CimInstance -Namespace root\Microsoft\Windows\DeviceGuard -ClassName Win32_DeviceGuard }
if ($dg) {
  Out (KV 'AvailableSecurityProperties' (($dg.AvailableSecurityProperties) -join ','))
  Out (KV 'RequiredSecurityProperties' (($dg.RequiredSecurityProperties) -join ','))
  Out (KV 'SecurityServicesConfigured' (($dg.SecurityServicesConfigured) -join ','))
}

# --- CPU ---
Out (Section 'CPU')
$cpu = Get-CimInstance Win32_Processor
foreach ($c in $cpu) {
  Out (KV 'Name' $c.Name.Trim())
  Out (KV 'Manufacturer' $c.Manufacturer)
  Out (KV 'Cores / Logical' ("{0} / {1}" -f $c.NumberOfCores, $c.NumberOfLogicalProcessors))
  Out (KV 'MaxClockMHz' $c.MaxClockSpeed)
  Out (KV 'L2/L3 Cache KB' ("{0} / {1}" -f $c.L2CacheSize, $c.L3CacheSize))
  Out (KV 'Socket' $c.SocketDesignation)
  Out (KV 'VirtualizationFirmware' $c.VirtualizationFirmwareEnabled)
}

# Intel hybrid hint via Get-ComputerInfo / registry
$procName = ($cpu | Select-Object -First 1).Name
Out (KV 'HybridHint' $(if ($procName -match '12|13|14|15\d{3}|Ultra') { 'Likely P+E cores — check Game Mode / process affinity' } else { 'Unlikely / check manually' }))

# --- MB / BIOS ---
Out (Section 'MOTHERBOARD / BIOS')
$bb = Get-CimInstance Win32_BaseBoard
$bios = Get-CimInstance Win32_BIOS
Out (KV 'Board' ("{0} {1}" -f $bb.Manufacturer, $bb.Product))
Out (KV 'BIOS Vendor' $bios.Manufacturer)
Out (KV 'BIOS Version' $bios.SMBIOSBIOSVersion)
Out (KV 'BIOS Date' $bios.ReleaseDate)
Out (KV 'Serial (board)' $bb.SerialNumber)

# --- RAM ---
Out (Section 'MEMORY')
Out (KV 'TotalGB' ([math]::Round($cs.TotalPhysicalMemory / 1GB, 2)))
$dimms = Get-CimInstance Win32_PhysicalMemory
$i = 0
foreach ($d in $dimms) {
  $i++
  Out (KV ("DIMM{0}" -f $i) ("{0} GB | {1} MHz | {2} | {3} | {4}" -f
    [math]::Round($d.Capacity / 1GB, 2),
    $d.ConfiguredClockSpeed,
    $d.Manufacturer,
    $d.PartNumber.Trim(),
    $d.DeviceLocator))
}
$speeds = $dimms.ConfiguredClockSpeed | Select-Object -Unique
Out (KV 'ConfiguredSpeedsMHz' ($speeds -join ', '))
Out (KV 'ChannelHint' $(if ($dimms.Count -ge 2) { 'Multi-stick present — verify dual/quad in CPU-Z' } else { 'Single stick?' }))

# --- GPU ---
Out (Section 'GPU / DISPLAY ADAPTERS')
$gpus = Get-CimInstance Win32_VideoController
foreach ($g in $gpus) {
  Out (KV 'Name' $g.Name)
  Out (KV 'DriverVersion' $g.DriverVersion)
  Out (KV 'DriverDate' $g.DriverDate)
  Out (KV 'VRAM_Bytes' $g.AdapterRAM)
  Out (KV 'VideoMode' $g.VideoModeDescription)
  Out (KV 'CurrentHz' $g.CurrentRefreshRate)
  Out (KV 'MaxHz' $g.MaxRefreshRate)
  Out (KV 'PNPDeviceID' $g.PNPDeviceID)
  Out '---'
}

# NVIDIA / AMD control panel registry hints
Out (Section 'GPU PROFILE HINTS (REGISTRY)')
$nvPath = 'HKCU:\Software\NVIDIA Corporation\Global\NVTweak'
Out (KV 'NVIDIA NVTweak exists' (Test-Path $nvPath))
$amd = Test-Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}'
Out (KV 'AMD class key present' $amd)

# Resizable BAR rough check via NVIDIA Display Container / PCI
$rebar = Try-Cmd {
  Get-CimInstance Win32_VideoController | ForEach-Object {
    $_.GetRelated('Win32_PnPEntity') | Out-Null
  }
  'Check GPU-Z Resizable BAR manually if critical'
}
Out (KV 'ResizableBAR' 'Verify in GPU-Z / NVIDIA-SMI — not reliably exposed via WMI')

# --- Monitors ---
Out (Section 'MONITORS')
$monWmi = Get-CimInstance -Namespace root\wmi -ClassName WmiMonitorID
$i = 0
foreach ($m in $monWmi) {
  $i++
  $name = ($m.UserFriendlyName | Where-Object { $_ -ne 0 } | ForEach-Object { [char]$_ }) -join ''
  $man = ($m.ManufacturerName | Where-Object { $_ -ne 0 } | ForEach-Object { [char]$_ }) -join ''
  $serial = ($m.SerialNumberID | Where-Object { $_ -ne 0 } | ForEach-Object { [char]$_ }) -join ''
  Out (KV ("Monitor{0}" -f $i) ("{0} | {1} | SN:{2} | Active:{3}" -f $man, $name, $serial, $m.Active))
}

# CCD / display config via DisplayConfig (basic)
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class DisplayHz {
  [DllImport("user32.dll")]
  public static extern bool EnumDisplaySettings(string deviceName, int modeNum, ref DEVMODE devMode);
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Ansi)]
  public struct DEVMODE {
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst=32)] public string dmDeviceName;
    public short dmSpecVersion, dmDriverVersion, dmSize, dmDriverExtra;
    public int dmFields, dmPositionX, dmPositionY, dmDisplayOrientation, dmDisplayFixedOutput;
    public short dmColor, dmDuplex, dmYResolution, dmTTOption, dmCollate;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst=32)] public string dmFormName;
    public short dmLogPixels;
    public int dmBitsPerPel, dmPelsWidth, dmPelsHeight, dmDisplayFlags, dmDisplayFrequency, dmICMMethod, dmICMIntent, dmMediaType, dmDitherType, dmReserved1, dmReserved2, dmPanningWidth, dmPanningHeight;
  }
}
"@ -ErrorAction SilentlyContinue

$dm = New-Object DisplayHz+DEVMODE
$dm.dmSize = [System.Runtime.InteropServices.Marshal]::SizeOf($dm)
if ([DisplayHz]::EnumDisplaySettings($null, -1, [ref]$dm)) {
  Out (KV 'PrimaryMode' ("{0}x{1} @{2}Hz {3}bpp" -f $dm.dmPelsWidth, $dm.dmPelsHeight, $dm.dmDisplayFrequency, $dm.dmBitsPerPel))
}

# --- Storage ---
Out (Section 'STORAGE')
Get-CimInstance Win32_DiskDrive | ForEach-Object {
  Out (KV 'Disk' ("{0} | {1:N0} GB | {2} | {3}" -f $_.Model, ($_.Size/1GB), $_.InterfaceType, $_.MediaType))
}
Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | ForEach-Object {
  Out (KV ("Volume {0}" -f $_.DeviceID) ("Free {0:N1}/{1:N1} GB | {2}" -f ($_.FreeSpace/1GB), ($_.Size/1GB), $_.FileSystem))
}

# --- Network ---
Out (Section 'NETWORK ADAPTERS')
Get-NetAdapter | Where-Object { $_.Status -ne $null } | ForEach-Object {
  Out (KV $_.Name ("{0} | {1} | {2} | {3}" -f $_.InterfaceDescription, $_.Status, $_.LinkSpeed, $_.MacAddress))
}
Out (Section 'ACTIVE IPv4')
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' } | ForEach-Object {
  Out (KV $_.InterfaceAlias $_.IPAddress)
}

# Advanced NIC properties (latency-relevant)
Out (Section 'NIC ADVANCED PROPS (LATENCY)')
$latencyProps = @(
  '*Interrupt*Moderation*', '*Energy*Efficient*', '*Green*Ethernet*', '*EEE*',
  '*Recv*Segment*Coalesc*', '*Large*Send*', '*RSS*', '*Flow*Control*',
  '*Receive*Buffers*', '*Transmit*Buffers*', '*Priority*'
)
Get-NetAdapter -Physical | Where-Object Status -eq 'Up' | ForEach-Object {
  $nic = $_
  Out ("-- {0} ({1}) --" -f $nic.Name, $nic.InterfaceDescription)
  Get-NetAdapterAdvancedProperty -Name $nic.Name | Where-Object {
    $dn = $_.DisplayName
    $latencyProps | Where-Object { $dn -like $_ }
  } | ForEach-Object {
    Out (KV $_.DisplayName $_.DisplayValue)
  }
}

# --- Power ---
Out (Section 'POWER')
$scheme = powercfg /getactivescheme
Out (KV 'ActiveScheme' $scheme)
$batt = @(Get-CimInstance Win32_Battery)
Out (KV 'FormFactorHint' $(if ($batt.Count -gt 0) { 'Battery present (laptop/handheld?)' } else { 'Desktop / no battery WMI' }))

# --- Processes / overlays ---
Out (Section 'OVERLAY / ESPORT PROCESSES')
$watch = @(
  'cs2','steam','faceit','discord','chrome','msedge','firefox','overwolf',
  'nvidia share','nvidia web helper','nvcontainer','amdow','radeonsoftware',
  'epicgameslauncher','lghub','icue','armoury','rgb','rtss','msi afterburner',
  'process lasso','parkcontrol','timertool','intelligent standby','asus','razertype'
)
Get-Process | Sort-Object Name -Unique | ForEach-Object {
  $n = $_.ProcessName
  foreach ($w in $watch) {
    if ($n -like "*$w*" -or $_.MainWindowTitle -like "*$w*") {
      Out (KV 'Running' ("{0}.exe  PID={1}" -f $n, $_.Id))
      break
    }
  }
}

# FACEIT specifically
$faceit = Get-Process | Where-Object { $_.ProcessName -match 'faceit|anticheat' }
if ($faceit) {
  Out (KV 'FACEIT-related' (($faceit.ProcessName | Select-Object -Unique) -join ', '))
} else {
  Out (KV 'FACEIT-related' 'Not running now')
}

# --- Services of interest ---
Out (Section 'KEY SERVICES')
$svcNames = @('FaceitService','FACEIT','Steam Client Service','SysMain','DiagTrack','WSearch','vgc','vgk','EasyAntiCheat','BEService')
foreach ($s in $svcNames) {
  $svc = Get-Service -Name $s -ErrorAction SilentlyContinue
  if (-not $svc) { $svc = Get-Service | Where-Object { $_.Name -like "*$s*" -or $_.DisplayName -like "*$s*" } | Select-Object -First 1 }
  if ($svc) { Out (KV $svc.Name ("{0} | {1}" -f $svc.Status, $svc.StartType)) }
}

# --- CS2 / Steam paths ---
Out (Section 'STEAM / CS2 PATHS')
$steamCandidates = @(
  (Try-Cmd { (Get-ItemProperty 'HKCU:\Software\Valve\Steam').SteamPath }),
  'C:\Program Files (x86)\Steam',
  'D:\Steam',
  'E:\Steam'
) | Where-Object { $_ } | Select-Object -Unique

$steamPath = $null
foreach ($p in $steamCandidates) {
  $norm = $p -replace '/', '\'
  if (Test-Path $norm) { $steamPath = $norm; break }
}
Out (KV 'SteamPath' $steamPath)

$libraryFolders = @()
if ($steamPath) {
  $vdf = Join-Path $steamPath 'steamapps\libraryfolders.vdf'
  Out (KV 'libraryfolders.vdf' $(if (Test-Path $vdf) { $vdf } else { 'missing' }))
  if (Test-Path $vdf) {
    $content = Get-Content $vdf -Raw
    [regex]::Matches($content, '"path"\s+"([^"]+)"') | ForEach-Object {
      $libraryFolders += $_.Groups[1].Value -replace '\\\\', '\'
    }
  }
  $libraryFolders = @($steamPath) + $libraryFolders | Select-Object -Unique
}

$cs2Root = $null
foreach ($lib in $libraryFolders) {
  $cand = Join-Path $lib 'steamapps\common\Counter-Strike Global Offensive'
  # CS2 still often under this folder name
  $cand2 = Join-Path $lib 'steamapps\common\Counter-Strike Global Offensive\game\csgo'
  if (Test-Path (Join-Path $lib 'steamapps\common\Counter-Strike Global Offensive\game\bin\win64\cs2.exe')) {
    $cs2Root = Join-Path $lib 'steamapps\common\Counter-Strike Global Offensive'
    break
  }
  if (Test-Path (Join-Path $lib 'steamapps\common\Counter-Strike 2\game\bin\win64\cs2.exe')) {
    $cs2Root = Join-Path $lib 'steamapps\common\Counter-Strike 2'
    break
  }
}
Out (KV 'CS2Root' $cs2Root)
if ($cs2Root) {
  $exe = Join-Path $cs2Root 'game\bin\win64\cs2.exe'
  if (Test-Path $exe) {
    $fi = Get-Item $exe
    Out (KV 'cs2.exe' $fi.FullName)
    Out (KV 'cs2.exe SizeMB' ([math]::Round($fi.Length/1MB, 1)))
    Out (KV 'cs2.exe Modified' $fi.LastWriteTime)
  }
}

# Video settings
Out (Section 'CS2 VIDEO SETTINGS FILES')
$videoHits = @()
if ($steamPath) {
  $ud = Join-Path $steamPath 'userdata'
  if (Test-Path $ud) {
    Get-ChildItem $ud -Directory | ForEach-Object {
      $paths = @(
        (Join-Path $_.FullName '730\local\cfg\cs2_video.txt'),
        (Join-Path $_.FullName '730\local\cfg\video.txt'),
        (Join-Path $_.FullName '730\local\cfg\cs2_machine_convars.vcfg')
      )
      foreach ($vp in $paths) {
        if (Test-Path $vp) { $videoHits += $vp }
      }
    }
  }
}
if ($cs2Root) {
  $cfgDir = Join-Path $cs2Root 'game\csgo\cfg'
  if (Test-Path $cfgDir) {
    Get-ChildItem $cfgDir -Filter '*video*' -ErrorAction SilentlyContinue | ForEach-Object { $videoHits += $_.FullName }
  }
}
$videoHits = $videoHits | Select-Object -Unique
if (-not $videoHits) { Out 'No CS2 video cfg found (Steam userdata empty or different library).' }
foreach ($vh in $videoHits) {
  Out ("-- FILE: $vh --")
  Out (Get-Content $vh -Raw)
}

# Launch options from localconfig.vdf (best effort)
Out (Section 'STEAM LAUNCH OPTIONS (730)')
$launchFound = $false
if ($steamPath) {
  Get-ChildItem (Join-Path $steamPath 'userdata') -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $lc = Join-Path $_.FullName 'config\localconfig.vdf'
    if (Test-Path $lc) {
      $raw = Get-Content $lc -Raw
      # Rough extract for app 730 LaunchOptions
      if ($raw -match '(?s)"730"\s*\{.*?"LaunchOptions"\s*"([^"]*)"') {
        Out (KV ("User {0}" -f $_.Name) $Matches[1])
        $launchFound = $true
      }
    }
  }
}
if (-not $launchFound) { Out 'LaunchOptions for 730 not found (parse miss or unset).' }

# --- Stability hints ---
Out (Section 'STABILITY / EVENT LOG (LAST 48H)')
$since = (Get-Date).AddHours(-48)
$whea = Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Microsoft-Windows-WHEA-Logger'; StartTime=$since} -MaxEvents 15
if ($whea) {
  Out (KV 'WHEA events' $whea.Count)
  $whea | Select-Object -First 5 | ForEach-Object { Out ("  {0} Id={1} {2}" -f $_.TimeCreated, $_.Id, $_.Message.Split("`n")[0]) }
} else { Out (KV 'WHEA events' '0') }

$displayErr = Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Display'; StartTime=$since} -MaxEvents 10
$nv = Get-WinEvent -FilterHashtable @{LogName='System'; StartTime=$since; Level=2,3} -MaxEvents 80 |
  Where-Object { $_.ProviderName -match 'nvlddmkm|amdkmdag|Display|Kernel-Power|Disk' }
Out (KV 'Kernel/GPU/Disk warns(sample)' @($nv).Count)
$nv | Select-Object -First 8 | ForEach-Object {
  Out ("  {0} [{1}] Id={2} {3}" -f $_.TimeCreated, $_.ProviderName, $_.Id, (($_.Message -split "`r?`n")[0]))
}

# --- Autostart junk ---
Out (Section 'RUN KEYS (HKCU/HKLM)')
foreach ($rp in @(
  'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run',
  'HKLM:\Software\Microsoft\Windows\CurrentVersion\Run'
)) {
  if (Test-Path $rp) {
    Out ("-- $rp --")
    Get-ItemProperty $rp | Out-String | ForEach-Object { Out $_.Trim() }
  }
}

# --- Manual fields for user (script cannot know) ---
Out (Section 'MANUAL — FILL BEFORE SEND')
Out 'SymptomClass        : A tearing | B microstutter | C input lag | D hitch 0.5s+ | E mix ____'
Out 'When                : always / fights / smokes / round change / after update ____'
Out 'OfflineAlso         : yes/no (bot DM without FACEIT)'
Out 'MonitorCable        : DP / HDMI'
Out 'GSYNC_FreeSync      : on/off'
Out 'CS2_DisplayMode     : fullscreen / borderless'
Out 'fps_max             : ____'
Out 'AVG_1pct_0.1pct     : ____ / ____ / ____   (CapFrameX or RTSS)'
Out 'Ping_Loss_Choke_Var : ____ / ____ / ____ / ____'
Out 'OC_Undervolt        : none / describe ____'
Out 'CustomISO_Playbook  : stock / name ____'
Out 'DualBoot            : no / yes ____'

Out ''
Out '=== END OF REPORT ==='
Out 'Colle ce fichier entier dans le chat Cursor.'

$report = $sb.ToString()
[System.IO.File]::WriteAllText($outFile, $report, [System.Text.UTF8Encoding]::new($false))

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' FaceitEsportDiag terminé' -ForegroundColor Cyan
Write-Host " Rapport : $outFile" -ForegroundColor Yellow
Write-Host ' Ouvre le fichier, complète la section MANUAL, colle tout ici.' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

# Also open folder / notepad
Try-Cmd { Start-Process notepad.exe $outFile } | Out-Null
Try-Cmd { explorer.exe /select,$outFile } | Out-Null
