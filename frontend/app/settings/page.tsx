'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  KeyIcon,
  CloudIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface ApiConfiguration {
  apolloApiKey: string;
  apolloTestStatus: 'untested' | 'testing' | 'success' | 'error';
  apolloLastTested?: string;
  apolloErrorMessage?: string;
}

interface SystemSettings {
  apiUrl: string;
  embeddingServiceUrl: string;
  defaultPageSize: number;
  autoRefreshInterval: number;
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export default function SettingsPage() {
  const [apiConfig, setApiConfig] = useState<ApiConfiguration>({
    apolloApiKey: '',
    apolloTestStatus: 'untested',
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    embeddingServiceUrl: 'http://localhost:8001',
    defaultPageSize: 20,
    autoRefreshInterval: 300, // 5 minutes
    enableNotifications: true,
    theme: 'system',
  });
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load from localStorage for now (in production, this would come from a secure backend)
        const savedApiConfig = localStorage.getItem('apiConfiguration');
        const savedSystemSettings = localStorage.getItem('systemSettings');

        if (savedApiConfig) {
          setApiConfig(JSON.parse(savedApiConfig));
        }
        if (savedSystemSettings) {
          setSystemSettings(JSON.parse(savedSystemSettings));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const testApolloConnection = async () => {
    if (!apiConfig.apolloApiKey.trim()) {
      setApiConfig(prev => ({
        ...prev,
        apolloTestStatus: 'error',
        apolloErrorMessage: 'API key is required',
      }));
      return;
    }

    setApiConfig(prev => ({ ...prev, apolloTestStatus: 'testing' }));

    try {
      // Test Apollo API connection
      const response = await fetch('/api/admin/apollo/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiConfig.apolloApiKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApiConfig(prev => ({
          ...prev,
          apolloTestStatus: 'success',
          apolloLastTested: new Date().toISOString(),
          apolloErrorMessage: undefined,
        }));
      } else {
        const error = await response.json();
        setApiConfig(prev => ({
          ...prev,
          apolloTestStatus: 'error',
          apolloErrorMessage: error.message || 'API test failed',
        }));
      }
    } catch (error) {
      setApiConfig(prev => ({
        ...prev,
        apolloTestStatus: 'error',
        apolloErrorMessage: error instanceof Error ? error.message : 'Connection failed',
      }));
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setSaveMessage(null);

    try {
      // Save to localStorage (in production, this would be saved to secure backend)
      localStorage.setItem('apiConfiguration', JSON.stringify(apiConfig));
      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));

      setSaveMessage('Settings saved successfully');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Failed to save settings');
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSystemSettings({
      apiUrl: 'http://localhost:5000',
      embeddingServiceUrl: 'http://localhost:8001',
      defaultPageSize: 20,
      autoRefreshInterval: 300,
      enableNotifications: true,
      theme: 'system',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <div className="animate-spin h-5 w-5 border-b-2 border-blue-500 rounded-full"></div>;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Tested</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          {saveMessage && (
            <div className={`px-4 py-2 rounded-md ${
              saveMessage.includes('success') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {saveMessage}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <KeyIcon className="h-5 w-5" />
                <span>API Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Apollo API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apollo API Key
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiConfig.apolloApiKey}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, apolloApiKey: e.target.value }))}
                      placeholder="Enter your Apollo API key"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <Button
                    onClick={testApolloConnection}
                    disabled={apiConfig.apolloTestStatus === 'testing'}
                    className="flex items-center space-x-2"
                  >
                    {getStatusIcon(apiConfig.apolloTestStatus)}
                    <span>Test</span>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  {getStatusBadge(apiConfig.apolloTestStatus)}
                  {apiConfig.apolloLastTested && (
                    <span className="text-xs text-gray-500">
                      Last tested: {new Date(apiConfig.apolloLastTested).toLocaleString()}
                    </span>
                  )}
                </div>
                
                {apiConfig.apolloErrorMessage && (
                  <p className="text-sm text-red-600 mt-1">{apiConfig.apolloErrorMessage}</p>
                )}
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                <p className="font-medium">About Apollo API</p>
                <p>The Apollo API is used to fetch company and contact data. You can get an API key from apollo.io.</p>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cog6ToothIcon className="h-5 w-5" />
                <span>System Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Base URL
                </label>
                <Input
                  value={systemSettings.apiUrl}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
                  placeholder="http://localhost:5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Embedding Service URL
                </label>
                <Input
                  value={systemSettings.embeddingServiceUrl}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, embeddingServiceUrl: e.target.value }))}
                  placeholder="http://localhost:8001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Page Size
                </label>
                <Input
                  type="number"
                  min="5"
                  max="100"
                  value={systemSettings.defaultPageSize}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, defaultPageSize: parseInt(e.target.value) || 20 }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto Refresh Interval (seconds)
                </label>
                <Input
                  type="number"
                  min="30"
                  max="3600"
                  value={systemSettings.autoRefreshInterval}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, autoRefreshInterval: parseInt(e.target.value) || 300 }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={systemSettings.enableNotifications}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                  Enable Notifications
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={systemSettings.theme}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CloudIcon className="h-5 w-5" />
              <span>Service Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Backend API</div>
                  <div className="text-sm text-gray-600">{systemSettings.apiUrl}</div>
                </div>
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Embedding Service</div>
                  <div className="text-sm text-gray-600">{systemSettings.embeddingServiceUrl}</div>
                </div>
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Apollo API</div>
                  <div className="text-sm text-gray-600">apollo.io</div>
                </div>
                {getStatusIcon(apiConfig.apolloTestStatus)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={resetToDefaults}
          >
            Reset to Defaults
          </Button>
          
          <Button
            onClick={saveSettings}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading && <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>}
            <span>Save Settings</span>
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
