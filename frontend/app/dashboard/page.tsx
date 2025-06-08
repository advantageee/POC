'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { companiesApi } from '@/lib/api';

export default function DashboardPage() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiData, setApiData] = useState<any>(null);
  const [backendHealth, setBackendHealth] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Test API connection
    const testAPI = async () => {
      try {
        const response = await companiesApi.getAll({ page: 1, pageSize: 5 });
        setApiData(response);
        setApiStatus('success');
      } catch (error) {
        console.error('API test failed:', error);
        setApiStatus('error');
      }
    };

    // Test backend health
    const testBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        if (response.ok) {
          setBackendHealth('success');
        } else {
          setBackendHealth('error');
        }
      } catch (error) {
        setBackendHealth('error');
      }
    };    testAPI();
    testBackend();
  }, []);

  const stats = [
    {
      title: 'Total Companies',
      value: '1,247',
      change: '+12%',
      changeType: 'positive' as const,
      icon: BuildingOfficeIcon,
    },
    {
      title: 'Active Contacts',
      value: '3,891',
      change: '+8%',
      changeType: 'positive' as const,
      icon: UserGroupIcon,
    },
    {
      title: 'Investment Volume',
      value: '$2.4B',
      change: '+23%',
      changeType: 'positive' as const,
      icon: BanknotesIcon,
    },
    {
      title: 'Active Alerts',
      value: '67',
      change: '-5%',
      changeType: 'negative' as const,
      icon: ExclamationTriangleIcon,
    },
  ];

  const recentActivities = [
    {
      type: 'investment',
      company: 'TechCorp Solutions',
      description: 'Raised $50M Series B funding',
      time: '2 hours ago',
      severity: 'high' as const,
    },
    {
      type: 'signal',
      company: 'GreenTech Industries',
      description: 'New executive hire - former Google VP',
      time: '4 hours ago',
      severity: 'medium' as const,
    },
    {
      type: 'company',
      company: 'BioMed Innovations',
      description: 'Updated company profile and metrics',
      time: '6 hours ago',
      severity: 'low' as const,
    },
    {
      type: 'investment',
      company: 'FinTech Startup',
      description: 'Seed round completed - $2M raised',
      time: '1 day ago',
      severity: 'medium' as const,
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your portfolio.</p>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  {backendHealth === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : backendHealth === 'error' ? (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span className="text-sm">Backend API</span>
                  <Badge variant={backendHealth === 'success' ? 'success' : backendHealth === 'error' ? 'destructive' : 'secondary'}>
                    {backendHealth === 'success' ? 'Online' : backendHealth === 'error' ? 'Offline' : 'Checking...'}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-3">
                  {apiStatus === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : apiStatus === 'error' ? (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span className="text-sm">Companies API</span>
                  <Badge variant={apiStatus === 'success' ? 'success' : apiStatus === 'error' ? 'destructive' : 'secondary'}>
                    {apiStatus === 'success' ? 'Working' : apiStatus === 'error' ? 'Error' : 'Testing...'}
                  </Badge>
                </div>

                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Frontend</span>
                  <Badge variant="success">Running</Badge>
                </div>
              </div>
              
              {apiStatus === 'success' && apiData && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Successfully loaded {apiData.total} companies from the API
                  </p>
                </div>
              )}
              
              {apiStatus === 'error' && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    ❌ API connection failed. Using fallback data for demo purposes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <stat.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.severity === 'high' ? 'bg-red-500' :
                          activity.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.company}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link href="/alerts">
                      <Button variant="outline" className="w-full">
                        View All Activities
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Feature Tests */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Link href="/companies" className="block">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                      <BuildingOfficeIcon className="w-6 h-6" />
                      <span className="text-sm">Browse Companies</span>
                    </Button>
                  </Link>
                  <Link href="/search" className="block">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                      <ChartBarIcon className="w-6 h-6" />
                      <span className="text-sm">Smart Search</span>
                    </Button>
                  </Link>
                  <Link href="/alerts" className="block">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                      <ExclamationTriangleIcon className="w-6 h-6" />
                      <span className="text-sm">View Alerts</span>
                    </Button>
                  </Link>
                  <Link href="/api-test" className="block">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                      <ArrowTrendingUpIcon className="w-6 h-6" />
                      <span className="text-sm">API Test</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Portfolio Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">High-Score Companies</span>
                      <span className="text-sm font-medium">142</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Monitoring</span>
                      <span className="text-sm font-medium">89</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Recent Funding</span>
                      <span className="text-sm font-medium">23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Risk Flagged</span>
                      <span className="text-sm font-medium text-red-600">8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
