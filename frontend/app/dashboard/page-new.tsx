'use client';

import { useState, useEffect } from 'react';
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
    };

    testAPI();
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <Badge variant={backendHealth === 'success' ? 'default' : 'destructive'}>
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
                    <Badge variant={apiStatus === 'success' ? 'default' : 'destructive'}>
                      {apiStatus === 'success' ? 'Connected' : apiStatus === 'error' ? 'Error' : 'Checking...'}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Frontend</span>
                    <Badge variant="default">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <Card key={item.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{item.title}</dt>
                          <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        item.changeType === 'positive' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <ArrowTrendingUpIcon
                          className={`-ml-1 mr-0.5 flex-shrink-0 h-4 w-4 ${
                            item.changeType === 'positive' ? 'text-green-500' : 'text-red-500 rotate-180'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="sr-only">
                          {item.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                        </span>
                        {item.change}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                          activity.severity === 'high' ? 'bg-red-400' :
                          activity.severity === 'medium' ? 'bg-yellow-400' :
                          'bg-green-400'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.company}</p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/alerts"
                      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View All Activities
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Link
                      href="/search"
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Search Companies
                    </Link>
                    <Link
                      href="/companies"
                      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Browse Companies
                    </Link>
                    <Link
                      href="/exports"
                      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Export Data
                    </Link>
                  </div>
                  
                  {/* API Data Display */}
                  {apiData && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Latest Companies</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Found {apiData.total} companies total
                      </p>
                      {apiData.data && apiData.data.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {apiData.data.slice(0, 3).map((company: any, index: number) => (
                            <div key={index} className="text-xs">
                              <span className="font-medium">{company.name}</span>
                              {company.industry && (
                                <span className="text-gray-500"> - {company.industry}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
