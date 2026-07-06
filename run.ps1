param(
    [string]$ProjectFile = "D:\\djenidi\\app-emit\\backend\\AppEmit.API\\AppEmit.API.csproj"
)

$ErrorActionPreference = 'Stop'

Write-Host "Running project: $projectFile"
Set-Location "D:/djenidi/app-emit/backend"
dotnet run --project $projectFile