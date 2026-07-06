param(
    [string]$ProjectFile = "D:\\djenidi\\app-emit\\backend\\AppEmit.API\\AppEmit.API.csproj"
)

# Set environment variables before running the application
$ErrorActionPreference = 'Stop'

Write-Host "Setting up environment variables..."
$env:JWT_KEY = "test-jwt-key-for-testing-only"

Write-Host "Running application..."
dotnet run --project "$ProjectFile" --environment Development
