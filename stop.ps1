Write-Host "Stopping MAD EATS services..." -ForegroundColor Yellow

$p8080 = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if ($p8080) {
    Stop-Process -Id $p8080.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "Backend stopped." -ForegroundColor Green
}

$p5173 = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($p5173) {
    Stop-Process -Id $p5173.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "Frontend stopped." -ForegroundColor Green
}

Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*jdk-21*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*cdrive_files\nodejs*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "All MAD EATS services have been stopped." -ForegroundColor Green
