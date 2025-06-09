# Test script to verify real API integration
Write-Host "Testing Investor Codex Real API Integration" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
    Write-Host "✓ Health Check: $($health.status)" -ForegroundColor Green
    Write-Host "  Environment: $($health.environment)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Companies API (Apollo Integration)
Write-Host "`n2. Testing Companies API (Apollo Integration)..." -ForegroundColor Yellow
try {
    $companies = Invoke-RestMethod -Uri "http://localhost:5000/api/companies?pageSize=5" -Method GET
    Write-Host "✓ Companies API: Found $($companies.total) companies" -ForegroundColor Green
    Write-Host "  Sample Company: $($companies.data[0].name) - $($companies.data[0].industry)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Companies API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Signals API (Twitter Integration)
Write-Host "`n3. Testing Signals API (Twitter Integration)..." -ForegroundColor Yellow
try {
    $signals = Invoke-RestMethod -Uri "http://localhost:5000/api/signals?pageSize=5" -Method GET
    Write-Host "✓ Signals API: Found $($signals.total) signals" -ForegroundColor Green
    if ($signals.data.Count -gt 0) {
        $signal = $signals.data[0]
        Write-Host "  Sample Signal: $($signal.type) - $($signal.title)" -ForegroundColor Cyan
        Write-Host "  Source: $($signal.source)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Signals API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Contacts API
Write-Host "`n4. Testing Contacts API..." -ForegroundColor Yellow
try {
    $contacts = Invoke-RestMethod -Uri "http://localhost:5000/api/contacts?pageSize=5" -Method GET
    Write-Host "✓ Contacts API: Found $($contacts.total) contacts" -ForegroundColor Green
    if ($contacts.data.Count -gt 0) {
        Write-Host "  Sample Contact: $($contacts.data[0].name) - $($contacts.data[0].title)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Contacts API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Frontend Accessibility
Write-Host "`n5. Testing Frontend Accessibility..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3004" -Method GET -UseBasicParsing
    if ($frontend.StatusCode -eq 200) {
        Write-Host "✓ Frontend: Accessible at http://localhost:3004" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Frontend Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n================================================" -ForegroundColor Green
Write-Host "Integration Test Complete!" -ForegroundColor Green
Write-Host "Visit http://localhost:3006 to use the application" -ForegroundColor Cyan
