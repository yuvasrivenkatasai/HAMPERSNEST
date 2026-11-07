# Helper Script to Generate and Copy ORACLE_WALLET_BASE64 Secret
# Run this script in PowerShell to get the exact value for GitHub Secret

$ProgressPreference = 'SilentlyContinue'

$candidates = @(
    (Join-Path $PSScriptRoot "..\..\hampersnest-backend\wallet"),
    (Join-Path $PSScriptRoot "..\wallet")
)

$walletDir = $null
foreach ($c in $candidates) {
    if (Test-Path $c) {
        $walletDir = (Resolve-Path $c).Path
        break
    }
}

if (-not $walletDir) {
    Write-Error "Wallet directory not found in hampersnest-backend or hampersnest-database!"
    exit 1
}

$zipFile = Join-Path $env:TEMP "hampersnest_wallet.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }

Write-Host "Creating temporary zip archive from $walletDir..."
Compress-Archive -Path "$walletDir\*" -DestinationPath $zipFile -Force

Write-Host "Encoding wallet to Base64..."
$base64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($zipFile))
Remove-Item $zipFile -Force

# Save to gitignored text file for easy manual copy
$outFile = Join-Path $PSScriptRoot "wallet-base64.txt"
[System.IO.File]::WriteAllText($outFile, $base64)

$copiedToClipboard = $false
try {
    Set-Clipboard -Value $base64 -ErrorAction Stop
    $copiedToClipboard = $true
} catch {
    # Headless / remote session clipboard fallback
}

Write-Host "`n=================================================================" -ForegroundColor Green
if ($copiedToClipboard) {
    Write-Host "SUCCESS! The ORACLE_WALLET_BASE64 string has been copied to your clipboard." -ForegroundColor Green
} else {
    Write-Host "SUCCESS! The ORACLE_WALLET_BASE64 string has been generated." -ForegroundColor Green
}
Write-Host "Also saved to: $outFile" -ForegroundColor Yellow
Write-Host "Length: $($base64.Length) characters" -ForegroundColor Cyan
Write-Host "`nGitHub Configuration Steps:" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/GruhaSankalp/HampersNest-Database/settings/secrets/actions" -ForegroundColor Cyan
Write-Host "2. Click 'New repository secret'" -ForegroundColor Cyan
Write-Host "3. Name  : ORACLE_WALLET_BASE64" -ForegroundColor Cyan
Write-Host "4. Secret: Paste clipboard (Ctrl + V) or copy from $outFile" -ForegroundColor Cyan
Write-Host "=================================================================`n" -ForegroundColor Green
