Write-Host "Testing Investor Codex Real API Integration" -ForegroundColor Green

# Test Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
    Write-Host "Success: Health Check - $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "Failed: Health Check - $($_.Exception.Message)" -ForegroundColor Red
}

# Test Companies API
Write-Host "2. Testing Companies API..." -ForegroundColor Yellow
try {
    $companies = Invoke-RestMethod -Uri "http://localhost:5000/api/companies?pageSize=5" -Method GET
    Write-Host "Success: Companies API - Found $($companies.total) companies" -ForegroundColor Green
} catch {
    Write-Host "Failed: Companies API - $($_.Exception.Message)" -ForegroundColor Red
}

# Test Signals API
Write-Host "3. Testing Signals API..." -ForegroundColor Yellow
try {
    $signals = Invoke-RestMethod -Uri "http://localhost:5000/api/signals?pageSize=5" -Method GET
    Write-Host "Success: Signals API - Found $($signals.total) signals" -ForegroundColor Green
} catch {
    Write-Host "Failed: Signals API - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Integration Test Complete!" -ForegroundColor Green
