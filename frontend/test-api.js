// Test script to verify API integration with CORS
const API_BASE_URL = 'http://localhost:5000';

async function testApiIntegration() {
  console.log('Testing API integration with CORS...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/companies`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3002',
        'Content-Type': 'application/json'
      }
    });
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('CORS test - Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Companies data received:', data);
      console.log('Number of companies:', data.data?.length || 0);
    } else {
      console.error('API request failed:', response.statusText);
    }
  } catch (error) {
    console.error('Network error:', error);
  }  
  // Test other endpoints with CORS
  try {
    console.log('\nTesting contacts endpoint...');
    const contactsResponse = await fetch(`${API_BASE_URL}/api/contacts`, {
      headers: { 'Origin': 'http://localhost:3002' }
    });
    if (contactsResponse.ok) {
      const contactsData = await contactsResponse.json();
      console.log('Contacts data received:', contactsData.data?.length || 0, 'contacts');
    }
  } catch (error) {
    console.error('Contacts endpoint error:', error);
  }
  
  try {
    console.log('\nTesting investments endpoint...');
    const investmentsResponse = await fetch(`${API_BASE_URL}/api/investments`, {
      headers: { 'Origin': 'http://localhost:3002' }
    });
    if (investmentsResponse.ok) {
      const investmentsData = await investmentsResponse.json();
      console.log('Investments data received:', investmentsData.data?.length || 0, 'investments');
    }
  } catch (error) {
    console.error('Investments endpoint error:', error);
  }
}

testApiIntegration();
