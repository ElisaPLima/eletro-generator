# ECG Builder - Local Server Launcher
# Run this script to start a local web server for testing

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  ECG Builder - Local Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
}

if ($pythonCmd) {
    Write-Host "Starting Python HTTP Server..." -ForegroundColor Green
    Write-Host "Server will be available at:" -ForegroundColor Yellow
    Write-Host "  http://localhost:8000" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host ""
    
    # Change to the script directory
    Set-Location $PSScriptRoot
    
    # Start Python HTTP server
    & $pythonCmd -m http.server 8000
} else {
    Write-Host "Python not found. Opening file directly in browser..." -ForegroundColor Yellow
    Write-Host ""
    
    $indexPath = Join-Path $PSScriptRoot "index.html"
    if (Test-Path $indexPath) {
        Start-Process $indexPath
        Write-Host "ECG Builder opened in default browser" -ForegroundColor Green
    } else {
        Write-Host "Error: index.html not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
