@echo off
SET HOST=localhost
SET DB_PORT=5432
SET DATABASENAME=app_emit
SET DB_USER=postgres
SET DB_PASSWORD=postgres
SET JWT_KEY=test-jwt-key-for-testing-only

echo Starting application...
cd "D:/djenidi/app-emit/backend"
dotnet run "AppEmit.API/AppEmit.API.csproj" --verbosity minimal