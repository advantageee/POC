# Test the backend API directly
Write-Host "Testing backend API at http://localhost:5000/api/companies"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/companies" -Method GET -ContentType "application/json"
    Write-Host "✅ API Response Status: $($response.StatusCode)"
    Write-Host "✅ API Response Headers:"
    $response.Headers | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" }
    Write-Host "✅ API Response Data:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)"
    Write-Host "❌ Full Error: $($_)"
}

Write-Host "`nTesting with CORS headers..."
try {
    $headers = @{
        'Origin' = 'http://localhost:3000'
        'Content-Type' = 'application/json'
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/companies" -Method GET -Headers $headers
    Write-Host "✅ CORS Test - Status: $($response.StatusCode)"
    Write-Host "✅ CORS Test - Access-Control-Allow-Origin: $($response.Headers['Access-Control-Allow-Origin'])"
} catch {
    Write-Host "❌ CORS Test Error: $($_.Exception.Message)"
}
