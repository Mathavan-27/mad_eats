$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
$env:PATH = "C:\Program Files\Java\jdk-21.0.12\bin;D:\cdrive_files\nodejs;" + $env:PATH

Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='C:\Program Files\Java\jdk-21.0.12'; `$env:PATH='C:\Program Files\Java\jdk-21.0.12\bin;D:\cdrive_files\nodejs;' + `$env:PATH; cd D:\projects\backend; .\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH='D:\cdrive_files\nodejs;' + `$env:PATH; cd D:\projects\frontend; npm run dev"

Write-Host "MAD EATS servers started successfully!" -ForegroundColor Green
Write-Host "Frontend Store & Owner Portal: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend Health Check:         http://localhost:8080/api/health" -ForegroundColor Cyan
