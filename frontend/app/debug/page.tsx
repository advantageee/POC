'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [apiResult, setApiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApiDirect = async () => {
    setLoading(true);
    setError(null);
    setApiResult(null);

    try {
      console.log('🔄 Testing direct API call...');
      const response = await fetch('http://localhost:5000/api/companies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      setApiResult(data);
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testFromEnv = async () => {
    setLoading(true);
    setError(null);
    setApiResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('🔄 Testing API call with env URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/companies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      setApiResult(data);
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Debug Page</h1>
      
      <div className="space-y-4 mb-8">
        <div>
          <strong>Environment Variables:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2">
            NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'undefined'}{'\n'}
            NEXT_PUBLIC_ENABLE_AUTH: {process.env.NEXT_PUBLIC_ENABLE_AUTH || 'undefined'}
          </pre>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={testApiDirect}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Direct API Call
          </button>
          
          <button
            onClick={testFromEnv}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test API with Env URL
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-blue-600 font-medium">Loading...</div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {apiResult && (
        <div>
          <h2 className="text-lg font-semibold mb-2">API Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(apiResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
