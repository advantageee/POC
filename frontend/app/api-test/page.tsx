'use client';

import { useState, useEffect } from 'react';
import { companiesApi } from '@/lib/api';
import type { PaginatedResponse, Company } from '@/types';

export default function ApiTestPage() {
  const [status, setStatus] = useState('Initializing...');
  const [data, setData] = useState<PaginatedResponse<Company> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testAPI() {
      setStatus('Testing API connection...');
      
      try {
        console.log('Testing API from React component...');
        const response = await companiesApi.getAll({ page: 1, pageSize: 5 });
        console.log('API Response:', response);
        
        setData(response);
        setStatus('✅ API working correctly!');
        setError(null);      } catch (err) {
        console.error('API Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('❌ API connection failed');
      }
    }

    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Investor Codex API Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Status: {status}</h2>
        {error && (
          <div style={{ color: 'red', background: '#fee', padding: '10px', borderRadius: '4px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {data && (
        <div>
          <h3>API Response Data:</h3>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
            <p><strong>Total Companies:</strong> {data.total}</p>
            <p><strong>Current Page:</strong> {data.page}</p>
            <p><strong>Page Size:</strong> {data.pageSize}</p>
              <h4>Companies:</h4>
            <ul>
              {data.data?.map((company: Company, index: number) => (
                <li key={company.id || index} style={{ marginBottom: '10px' }}>
                  <strong>{company.name}</strong> - {company.industry} ({company.fundingStage})
                  <br />
                  <small>Score: {company.investmentScore}, Headcount: {company.headcount}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
