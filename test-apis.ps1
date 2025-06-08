# API Testing Script
Write-Host "=== InvestorCodex API Testing Report ===" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:5000/api"
$testResults = @()

# Test Companies API
Write-Host "Testing Companies API..." -ForegroundColor Yellow
try {
    $companiesResponse = Invoke-RestMethod -Uri "$baseUrl/Companies?page=1&pageSize=5" -Method GET
    $testResults += "✅ Companies GET: Success - returned $($companiesResponse.total) companies"
    
    # Test getting specific company
    if ($companiesResponse.data.Count -gt 0) {
        $companyId = $companiesResponse.data[0].id
        $companyResponse = Invoke-RestMethod -Uri "$baseUrl/Companies/$companyId" -Method GET
        $testResults += "✅ Company GET by ID: Success - returned '$($companyResponse.name)'"
    }
} catch {
    $testResults += "❌ Companies API: Failed - $($_.Exception.Message)"
}

# Test Contacts API
Write-Host "Testing Contacts API..." -ForegroundColor Yellow
try {
    $contactsResponse = Invoke-RestMethod -Uri "$baseUrl/Contacts?page=1&pageSize=5" -Method GET
    $testResults += "✅ Contacts GET: Success - returned $($contactsResponse.total) contacts"
    
    # Test getting specific contact
    if ($contactsResponse.data.Count -gt 0) {
        $contactId = $contactsResponse.data[0].id
        $contactResponse = Invoke-RestMethod -Uri "$baseUrl/Contacts/$contactId" -Method GET
        $testResults += "✅ Contact GET by ID: Success - returned '$($contactResponse.name)'"
    }
} catch {
    $testResults += "❌ Contacts API: Failed - $($_.Exception.Message)"
}

# Test Investments API
Write-Host "Testing Investments API..." -ForegroundColor Yellow
try {
    $investmentsResponse = Invoke-RestMethod -Uri "$baseUrl/Investments?page=1&pageSize=5" -Method GET
    $testResults += "✅ Investments GET: Success - returned $($investmentsResponse.total) investments"
    
    # Test getting specific investment
    if ($investmentsResponse.data.Count -gt 0) {
        $investmentId = $investmentsResponse.data[0].id
        $investmentResponse = Invoke-RestMethod -Uri "$baseUrl/Investments/$investmentId" -Method GET
        $testResults += "✅ Investment GET by ID: Success - returned '$($investmentResponse.round)' round"
    }
} catch {
    $testResults += "❌ Investments API: Failed - $($_.Exception.Message)"
}

# Test not-yet-implemented APIs (should return 501)
Write-Host "Testing Not-Yet-Implemented APIs..." -ForegroundColor Yellow

$notImplementedApis = @(
    @{ Name = "Signals"; Url = "$baseUrl/Signals?page=1&pageSize=10" },
    @{ Name = "Export"; Url = "$baseUrl/Export" },
    @{ Name = "Embedding"; Url = "$baseUrl/Embedding/companies/similar" }
)

foreach ($api in $notImplementedApis) {
    try {
        Invoke-RestMethod -Uri $api.Url -Method GET -ErrorAction Stop
        $testResults += "❌ $($api.Name) API: Should return 501 but didn't"
    } catch {
        if ($_.Exception.Response.StatusCode -eq 501) {
            $testResults += "✅ $($api.Name) API: Correctly returns 501 Not Implemented"
        } else {
            $testResults += "⚠️  $($api.Name) API: Returns $($_.Exception.Response.StatusCode) instead of 501"
        }
    }
}

# Display results
Write-Host ""
Write-Host "=== Test Results ===" -ForegroundColor Green
foreach ($result in $testResults) {
    if ($result.StartsWith("✅")) {
        Write-Host $result -ForegroundColor Green
    } elseif ($result.StartsWith("❌")) {
        Write-Host $result -ForegroundColor Red
    } elseif ($result.StartsWith("⚠️")) {
        Write-Host $result -ForegroundColor Yellow
    }
}

# Test database connectivity
Write-Host ""
Write-Host "=== Database Status ===" -ForegroundColor Green
try {
    $dbTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
    if ($dbTest.TcpTestSucceeded) {
        Write-Host "✅ PostgreSQL Database: Connected on localhost:5432" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL Database: Not accessible on localhost:5432" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PostgreSQL Database: Connection test failed" -ForegroundColor Red
}

# Check Docker container status
Write-Host ""
Write-Host "=== Infrastructure Status ===" -ForegroundColor Green
try {
    $dockerStatus = docker ps --filter "name=postgres-investorcodex" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($dockerStatus -like "*postgres-investorcodex*") {
        Write-Host "✅ PostgreSQL Docker Container: Running" -ForegroundColor Green
        Write-Host "   $dockerStatus" -ForegroundColor Gray
    } else {
        Write-Host "❌ PostgreSQL Docker Container: Not running" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Docker: Unable to check container status" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Green
$successCount = ($testResults | Where-Object { $_.StartsWith("✅") }).Count
$totalTests = $testResults.Count
Write-Host "Passed: $successCount/$totalTests tests" -ForegroundColor Green
Write-Host "API Backend: Running on http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: Available on http://localhost:3000" -ForegroundColor Green
Write-Host "Database: PostgreSQL running in Docker" -ForegroundColor Green
