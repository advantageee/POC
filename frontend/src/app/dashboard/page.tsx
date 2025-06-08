'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
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
              <Card>                <CardHeader>
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

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/companies" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                      Browse Companies
                    </Button>
                  </Link>
                  <Link href="/search" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <ChartBarIcon className="w-4 h-4 mr-2" />
                      Smart Search
                    </Button>
                  </Link>
                  <Link href="/exports" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <BanknotesIcon className="w-4 h-4 mr-2" />
                      Export Data
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
