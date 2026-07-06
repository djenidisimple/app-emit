@echo off
setlocal enabledelayedexpansion

REM Set environment variables

set HOST=localhost
set DB_PORT=5432
set DATABASENAME=app_emit
set DB_USER=postgres
set DB_PASSWORD=postgres
set JWT_KEY=test-jwt-key-for-testing-only

set FRONTEND_URL=http://localhost:3000

REM Run the application
pushd "%~dp0%AppEmit.API%"
dotnet run --project AppEmit.API.csproj
popd