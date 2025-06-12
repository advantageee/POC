# Test script to verify real data integration fixes
Write-Host "=== Testing Real Data Integration ===" -ForegroundColor Green

$baseUrl = "http://localhost:5000/api"

# Test 1: Check if Apollo returns real companies instead of "Apollo Test"
Write-Host "`n1. Testing Apollo Company Data..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/companies?page=1&pageSize=10" -Method GET
    Write-Host "✓ Companies API responded successfully" -ForegroundColor Green
    
    if ($response.companies -and $response.companies.Count -gt 0) {
        $apolloTestCount = ($response.companies | Where-Object { $_.name -like "*Apollo Test*" }).Count
        $realCompanyCount = ($response.companies | Where-Object { $_.name -notlike "*Apollo Test*" -and $_.name -notlike "*Test*" }).Count
        
        Write-Host "  - Total companies: $($response.companies.Count)" -ForegroundColor Cyan
        Write-Host "  - Apollo Test companies: $apolloTestCount" -ForegroundColor Cyan
        Write-Host "  - Real companies: $realCompanyCount" -ForegroundColor Cyan
        
        if ($apolloTestCount -eq 0 -and $realCompanyCount -gt 0) {
            Write-Host "✓ PASS: No Apollo Test companies found, real data detected!" -ForegroundColor Green
        } elseif ($apolloTestCount -gt 0) {
            Write-Host "⚠ WARNING: Still finding Apollo Test companies" -ForegroundColor Yellow
        } else {
            Write-Host "⚠ INFO: No companies found - may be empty database" -ForegroundColor Yellow
        }
        
        # Show first few companies
        Write-Host "  Sample companies:" -ForegroundColor Cyan
        $response.companies | Select-Object -First 3 | ForEach-Object {
            Write-Host "    - $($_.name) ($($_.industry))" -ForegroundColor White
        }
    } else {
        Write-Host "⚠ No companies returned" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ FAIL: Companies API error - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Test company search for specific companies
Write-Host "`n2. Testing Company Search..." -ForegroundColor Yellow
$searchTerms = @("IBM", "Bell Canada", "Microsoft", "Apple")
foreach ($term in $searchTerms) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/companies/search?query=$term" -Method GET
        if ($response -and $response.Count -gt 0) {
            Write-Host "✓ Search for '$term' returned $($response.Count) results" -ForegroundColor Green
            $response | Select-Object -First 1 | ForEach-Object {
                Write-Host "    - Top result: $($_.name)" -ForegroundColor White
            }
        } else {
            Write-Host "⚠ Search for '$term' returned no results" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✗ Search for '$term' failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Test Twitter signals
Write-Host "`n3. Testing Twitter Signals..." -ForegroundColor Yellow
try {
    $signalsUrl = "$baseUrl/signals?page=1" + "&" + "pageSize=10"
    $response = Invoke-RestMethod -Uri $signalsUrl -Method GET
    Write-Host "✓ Signals API responded successfully" -ForegroundColor Green
    
    if ($response.signals -and $response.signals.Count -gt 0) {
        $twitterSignals = ($response.signals | Where-Object { $_.source -eq "Twitter" }).Count
        $recentSignals = ($response.signals | Where-Object { 
            $signalDate = [DateTime]::Parse($_.createdAt)
            $signalDate -gt (Get-Date).AddDays(-7)
        }).Count
        
        Write-Host "  - Total signals: $($response.signals.Count)" -ForegroundColor Cyan
        Write-Host "  - Twitter signals: $twitterSignals" -ForegroundColor Cyan
        Write-Host "  - Recent signals (7 days): $recentSignals" -ForegroundColor Cyan
        
        # Show sample signals
        Write-Host "  Sample signals:" -ForegroundColor Cyan
        $response.signals | Select-Object -First 3 | ForEach-Object {
            $desc = if ($_.description.Length -gt 50) { $_.description.Substring(0, 50) + "..." } else { $_.description }
            Write-Host "    - $($_.type): $desc" -ForegroundColor White
        }
    } else {
        Write-Host "⚠ No signals returned" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ FAIL: Signals API error - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test contacts
Write-Host "`n4. Testing Contacts..." -ForegroundColor Yellow
try {
    $contactsUrl = "$baseUrl/contacts?page=1" + "&" + "pageSize=10"
    $response = Invoke-RestMethod -Uri $contactsUrl -Method GET
    Write-Host "✓ Contacts API responded successfully" -ForegroundColor Green
    
    if ($response.contacts -and $response.contacts.Count -gt 0) {
        Write-Host "  - Total contacts: $($response.contacts.Count)" -ForegroundColor Cyan
        
        # Show sample contacts
        Write-Host "  Sample contacts:" -ForegroundColor Cyan
        $response.contacts | Select-Object -First 3 | ForEach-Object {
            Write-Host "    - $($_.firstName) $($_.lastName) ($($_.title)) at $($_.company)" -ForegroundColor White
        }
    } else {
        Write-Host "⚠ No contacts returned" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ FAIL: Contacts API error - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test high confidence signals (the method we just fixed)
Write-Host "`n5. Testing High Confidence Signals..." -ForegroundColor Yellow
try {
    $highConfUrl = "$baseUrl/signals/high-confidence?minConfidence=0.7" + "&" + "limit=10"
    $response = Invoke-RestMethod -Uri $highConfUrl -Method GET
    Write-Host "✓ High confidence signals API responded successfully" -ForegroundColor Green
    
    if ($response -and $response.Count -gt 0) {
        Write-Host "  - High confidence signals found: $($response.Count)" -ForegroundColor Cyan
        
        # Show sample high confidence signals
        Write-Host "  Sample high confidence signals:" -ForegroundColor Cyan
        $response | Select-Object -First 3 | ForEach-Object {
            $desc = if ($_.description.Length -gt 40) { $_.description.Substring(0, 40) + "..." } else { $_.description }
            Write-Host "    - $($_.type) (Confidence: $($_.confidence)): $desc" -ForegroundColor White
        }
    } else {
        Write-Host "⚠ No high confidence signals found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ FAIL: High confidence signals API error - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Green
Write-Host "Data integration tests completed. Check results above for any issues." -ForegroundColor White
Write-Host "Frontend is running at: http://localhost:3005" -ForegroundColor Cyan
Write-Host "Backend is running at: http://localhost:5000" -ForegroundColor Cyan
