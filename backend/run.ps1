# Verify dotnet is installed
$dotnetInfo = dotnet --info
Write-Host "DotNet installed: $dotnetInfo"

# Set environment variables
Write-Host "Setting environment variables..."
$env:HOST = "localhost"
$env:DB_PORT = "5432"
$env:DATABASENAME = "app_emit"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "postgres"
$env:JWT_KEY = "test-jwt-key-for-testing-only"

# Build the project
Write-Host "Building project..."
dotnet build "D:\djenidi\app-emit\backend\AppEmit.API\AppEmit.API.csproj"

# Run the project
Write-Host "Running application..."
dotnet run "D:\djenidi\app-emit\backend\AppEmit.API\AppEmit.API.csproj" 2>&1 | ForEach-Object { 
    if ($_ -match "\[SEED\]") { Write-Host "[$_]" -ForegroundColor Green }
    elseif ($_ -match "error|Error|exception|Exception") { Write-Host $_
    else { Write-Host $_ }
}