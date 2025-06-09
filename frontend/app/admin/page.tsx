'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Cog6ToothIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface SystemStats {
  database: {
    companiesCount: number;
    contactsCount: number;
    lastUpdated: string;
  };
  apollo: {
    status: string;
    optimizationEnabled: boolean;
    databaseFirst: boolean;
    investorFocused: boolean;
  };
  features: {
    smartSync: string;
    bulkLoad: string;
    intelligentQuerying: string;
    duplicateDetection: string;
  };
}

interface ApolloTestResult {
  status: string;
  companiesReturned: number;
  dataSource: string;
  apolloTotal: number;
  timestamp: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [bulkLoadLoading, setBulkLoadLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string>('');
  const [lastBulkResult, setLastBulkResult] = useState<string>('');
  const [testResult, setTestResult] = useState<ApolloTestResult | null>(null);

  // Load admin stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Test Apollo connection
  const testApollo = async () => {
    setTestLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/apollo/test');
      if (response.ok) {
        const data = await response.json();
        setTestResult(data);
      }
    } catch (error) {
      console.error('Apollo test failed:', error);
    } finally {
      setTestLoading(false);
    }
  };

  // Trigger Apollo sync
  const triggerSync = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/apollo/sync', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setLastSyncResult(data.message || 'Sync completed successfully');
        // Reload stats
        const statsResponse = await fetch('http://localhost:5000/api/admin/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setLastSyncResult('Sync failed: ' + error);
    } finally {
      setSyncLoading(false);
    }
  };

  // Trigger bulk load
  const triggerBulkLoad = async () => {
    setBulkLoadLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/apollo/bulk-load', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setLastBulkResult(`Bulk load completed: ${data.companiesLoaded} companies, ${data.contactsLoaded} contacts`);
        // Reload stats
        const statsResponse = await fetch('http://localhost:5000/api/admin/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      }
    } catch (error) {
      console.error('Bulk load failed:', error);
      setLastBulkResult('Bulk load failed: ' + error);
    } finally {
      setBulkLoadLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
      case 'enabled':
      case 'available':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
      case 'enabled':
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'error':
      case 'failed':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
              <p className="text-gray-600">Manage Apollo integration and system settings</p>
            </div>

            {/* System Status Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ChartBarIcon className="h-5 w-5" />
                      <span>Database Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Companies:</span>
                        <span className="font-medium">{stats.database.companiesCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Contacts:</span>
                        <span className="font-medium">{stats.database.contactsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Updated:</span>
                        <span className="text-xs text-gray-500">
                          {new Date(stats.database.lastUpdated).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CloudIcon className="h-5 w-5" />
                      <span>Apollo Integration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(stats.apollo.status)}
                          {getStatusBadge(stats.apollo.status)}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Database First:</span>
                        <Badge variant={stats.apollo.databaseFirst ? "default" : "secondary"}>
                          {stats.apollo.databaseFirst ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Investor Focused:</span>
                        <Badge variant={stats.apollo.investorFocused ? "default" : "secondary"}>
                          {stats.apollo.investorFocused ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Optimization Features</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Smart Sync:</span>
                        {getStatusBadge(stats.features.smartSync)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Bulk Load:</span>
                        {getStatusBadge(stats.features.bulkLoad)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Smart Querying:</span>
                        {getStatusBadge(stats.features.intelligentQuerying)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duplicate Detection:</span>
                        {getStatusBadge(stats.features.duplicateDetection)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Apollo Management Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Apollo Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Test Connection */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Test Connection</h4>
                    <p className="text-sm text-gray-600">Verify Apollo API connectivity and response</p>
                    <Button 
                      onClick={testApollo} 
                      disabled={testLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {testLoading ? (
                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <PlayIcon className="h-4 w-4 mr-2" />
                      )}
                      Test Apollo
                    </Button>
                    {testResult && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                        <p><strong>Status:</strong> {testResult.status}</p>
                        <p><strong>Companies:</strong> {testResult.companiesReturned}</p>
                        <p><strong>Source:</strong> {testResult.dataSource}</p>
                        <p><strong>Time:</strong> {new Date(testResult.timestamp).toLocaleTimeString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Smart Sync */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Smart Sync</h4>
                    <p className="text-sm text-gray-600">Intelligently sync with database awareness</p>
                    <Button 
                      onClick={triggerSync} 
                      disabled={syncLoading}
                      variant="default"
                      className="w-full"
                    >
                      {syncLoading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                      )}
                      Start Sync
                    </Button>
                    {lastSyncResult && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        {lastSyncResult}
                      </div>
                    )}
                  </div>

                  {/* Bulk Load */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Bulk Load</h4>
                    <p className="text-sm text-gray-600">Load all available companies and contacts</p>
                    <Button 
                      onClick={triggerBulkLoad} 
                      disabled={bulkLoadLoading}
                      variant="secondary"
                      className="w-full"
                    >
                      {bulkLoadLoading ? (
                        <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <CloudIcon className="h-4 w-4 mr-2" />
                      )}
                      Bulk Load
                    </Button>
                    {lastBulkResult && (
                      <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                        {lastBulkResult}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Apollo Optimization Status */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Database-First Strategy</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span>Check database before Apollo queries</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span>Cache Apollo results to database</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span>Duplicate detection and prevention</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Investor-Focused Features</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span>Venture capital company identification</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span>Investment-focused search terms</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span>Smart querying with rate limits</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
