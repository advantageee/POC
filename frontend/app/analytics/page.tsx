'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ChartBarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { companiesApi, signalsApi } from '@/lib/api';
import { api } from '@/lib/api/client';

interface AnalyticsData {
  companiesGrowth: {
    current: number;
    previous: number;
    change: number;
  };
  contactsGrowth: {
    current: number;
    previous: number;
    change: number;
  };
  signalsActivity: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  industryBreakdown: Array<{
    industry: string;
    count: number;
    percentage: number;
  }>;
  fundingStageDistribution: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  topCompanies: Array<{
    id: string;
    name: string;
    industry: string;
    investmentScore: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from multiple endpoints
      const [companiesResponse, contactsResponse, signalsResponse] = await Promise.allSettled([
        companiesApi.getAll({ page: 1, pageSize: 100 }),
        api.get('/api/contacts?pageSize=100'),
        signalsApi.getAll({ page: 1, pageSize: 100 }),
      ]);

      if (companiesResponse.status === 'fulfilled') {
        const companies = companiesResponse.value.data;
        
        // Calculate industry breakdown
        const industryMap = new Map<string, number>();
        companies.forEach(company => {
          const industry = company.industry || 'Unknown';
          industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
        });

        const industryBreakdown = Array.from(industryMap.entries())
          .map(([industry, count]) => ({
            industry,
            count,
            percentage: (count / companies.length) * 100,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Calculate funding stage distribution
        const stageMap = new Map<string, number>();
        companies.forEach(company => {
          const stage = company.fundingStage || 'Unknown';
          stageMap.set(stage, (stageMap.get(stage) || 0) + 1);
        });

        const fundingStageDistribution = Array.from(stageMap.entries())
          .map(([stage, count]) => ({
            stage,
            count,
            percentage: (count / companies.length) * 100,
          }))
          .sort((a, b) => b.count - a.count);        // Get top companies by investment score
        const topCompanies = companies
          .filter(company => (company.investmentScore ?? 0) > 0)
          .sort((a, b) => (b.investmentScore || 0) - (a.investmentScore || 0))
          .slice(0, 10)
          .map(company => ({
            id: company.id,
            name: company.name,
            industry: company.industry || 'Unknown',
            investmentScore: company.investmentScore || 0,
          }));

        let signalsActivity = { high: 0, medium: 0, low: 0, total: 0 };
        if (signalsResponse.status === 'fulfilled') {
          const signals = signalsResponse.value.data || [];
          signalsActivity = {
            high: signals.filter(s => s.severity === 'high').length,
            medium: signals.filter(s => s.severity === 'medium').length,
            low: signals.filter(s => s.severity === 'low').length,
            total: signals.length,
          };
        }

        setAnalytics({
          companiesGrowth: {
            current: companies.length,
            previous: Math.max(0, companies.length - Math.floor(Math.random() * 10)), // Mock previous data
            change: Math.floor(Math.random() * 20) - 5, // Mock change
          },
          contactsGrowth: {
            current: contactsResponse.status === 'fulfilled' ? (contactsResponse.value.total || 0) : 0,
            previous: contactsResponse.status === 'fulfilled' ? Math.max(0, (contactsResponse.value.total || 0) - Math.floor(Math.random() * 15)) : 0,
            change: Math.floor(Math.random() * 25) - 10,
          },
          signalsActivity,
          industryBreakdown,
          fundingStageDistribution,
          topCompanies,
        });
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {analytics && (
          <>
            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Companies</CardTitle>
                  <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.companiesGrowth.current}</div>                  <div className="flex items-center space-x-2 text-xs">
                    {analytics.companiesGrowth.change >= 0 ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 text-red-600" />
                    )}
                    <span className={analytics.companiesGrowth.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(analytics.companiesGrowth.change)}% from last period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contacts</CardTitle>
                  <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.contactsGrowth.current}</div>                  <div className="flex items-center space-x-2 text-xs">
                    {analytics.contactsGrowth.change >= 0 ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 text-red-600" />
                    )}
                    <span className={analytics.contactsGrowth.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(analytics.contactsGrowth.change)}% from last period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
                  <ExclamationTriangleIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.signalsActivity.total}</div>
                  <div className="flex space-x-2 text-xs">
                    <span className="text-red-600">{analytics.signalsActivity.high} High</span>
                    <span className="text-yellow-600">{analytics.signalsActivity.medium} Med</span>
                    <span className="text-green-600">{analytics.signalsActivity.low} Low</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                  <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.topCompanies.length > 0 
                      ? Math.round(analytics.topCompanies.reduce((sum, c) => sum + c.investmentScore, 0) / analytics.topCompanies.length)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Average investment score</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Industry Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.industryBreakdown.map((item, index) => (
                      <div key={item.industry} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full bg-blue-${(index + 1) * 100}`}></div>
                          <span className="text-sm font-medium">{item.industry}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{item.count}</span>
                          <Badge variant="secondary">{item.percentage.toFixed(1)}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Funding Stage Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Funding Stages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.fundingStageDistribution.map((item, index) => (
                      <div key={item.stage} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full bg-green-${(index + 1) * 100}`}></div>
                          <span className="text-sm font-medium">{item.stage}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{item.count}</span>
                          <Badge variant="secondary">{item.percentage.toFixed(1)}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Companies */}
            <Card>
              <CardHeader>
                <CardTitle>Top Investment Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topCompanies.map((company, index) => (
                    <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold text-gray-500">#{index + 1}</div>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-gray-600">{company.industry}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{company.investmentScore}</div>
                        <div className="text-xs text-gray-500">Investment Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}