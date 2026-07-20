param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("build", "test", "test-single")]
    [string]$Action,

    [Parameter(Mandatory=$false)]
    [string]$Target
)

# Navigate to the backend directory
Set-Location -Path "$PSScriptRoot\backend"

switch ($Action) {
    "build" {
        Write-Host "Building the backend application..." -ForegroundColor Cyan
        .\mvnw.cmd clean package -DskipTests
    }
    "test" {
        Write-Host "Running the entire unit test suite..." -ForegroundColor Cyan
        .\mvnw.cmd test
    }
    "test-single" {
        if (-not $Target) {
            Write-Host "Error: You must specify a target test class! (e.g., -Action test-single -Target MatchEngineTest)" -ForegroundColor Red
            Exit 1
        }
        Write-Host "Running targeted test: $Target..." -ForegroundColor Cyan
        .\mvnw.cmd test "-Dtest=$Target"
    }
}

# Navigate back to the root directory
Set-Location -Path $PSScriptRoot
