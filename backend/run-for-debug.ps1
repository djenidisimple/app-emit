# PowerShell script to run the application
$ErrorActionPreference = 'Stop'

# Set environment variables BEFORE running dotnet
Write-Host "Setting up environment variables..."
$env:HOST = "localhost"
$env:DB_PORT = "5432"
$env:DATABASENAME = "app_emit"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "postgres"
$env:JWT_KEY = "test-jwt-key-for-testing-only"
Write-Host "Environment variables set successfully."

# Build and run the project
Write-Host "Building project..."
Set-Location "D:/djenidi/app-emit/backend"
try {
    dotnet build "AppEmit.API/AppEmit.API.csproj"
}
catch {
    Write-Host "Build failed: $($_.Exception.Message)"
    exit 1
}

# Run the application
Write-Host "Starting application..."
dotnet run "AppEmit.API/AppEmit.API.csproj" --verbosity minimal 2>&1 | ForEach-Object {
    if ($_ -match "\[SEED\].*" ) {
        Write-Host $_
    }
    elseif ($_ -match "Warning.*" ) {
        Write-Host "[WARNING] "$_
    }
    elseif ($_ -match "error|Error|exception|Exception" ) {
        Write-Host "[ERROR] "$_
    }
    elseif ($_ -match "Building|Running.*" ) {
        Write-Host $_
    }
}
