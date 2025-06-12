'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate, formatRelativeTime, getSeverityColor, getSignalTypeIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  FunnelIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { signalsApi } from '@/lib/api';
import type { Signal, Company, PaginatedResponse } from '@/types';

interface AlertsTimelineProps {
  initialSignals?: (Signal & { company: Pick<Company, 'id' | 'name' | 'domain'> })[];
  initialLoading?: boolean;
}

export function AlertsTimeline({ initialSignals = [], initialLoading = false }: AlertsTimelineProps) {
  const [signals, setSignals] = useState<(Signal & { company: Pick<Company, 'id' | 'name' | 'domain'> })[]>(initialSignals);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    severity: [] as string[],
    type: [] as string[],
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load signals from API
  useEffect(() => {
    const loadSignals = async () => {
      if (initialSignals.length > 0) return; // Don't reload if we have initial data
      
      try {
        setLoading(true);
        setError(null);
        const response = await signalsApi.getAll({
          page: 1,
          pageSize: 50,
          minConfidence: 0.3
        });
        
        // Map API response to include mock company data since signals might not have full company objects
        const signalsWithCompanies = response.data.map(signal => ({
          ...signal,
          company: {
            id: signal.companyId || '1',
            name: `Company ${signal.companyId?.slice(0, 8) || 'Unknown'}`,
            domain: `company-${signal.companyId?.slice(0, 8) || 'unknown'}.com`
          }
        }));
        
        setSignals(signalsWithCompanies);
      } catch (err) {
        console.error('Failed to load signals:', err);
        setError('Failed to load signals. Using fallback data.');
        // Use mock data as fallback
        setSignals(getMockSignals());
      } finally {
        setLoading(false);
      }
    };

    loadSignals();
  }, [initialSignals]);

  // Mock data function for fallback
  const getMockSignals = (): (Signal & { company: Pick<Company, 'id' | 'name' | 'domain'> })[] => [
    {
      id: '1',
      companyId: '1',
      company: { id: '1', name: 'TechCorp Inc.', domain: 'techcorp.com' },
      type: 'funding',
      title: 'Series C Funding Round Announced',
      description: 'TechCorp announced a $50M Series C funding round led by Sequoia Capital. The funding will be used to expand their AI platform and international operations.',
      source: 'TechCrunch',
      url: 'https://techcrunch.com/funding-news',
      severity: 'high',
      tags: ['funding', 'growth', 'ai'],
      summary: 'Significant funding milestone indicating strong investor confidence and growth trajectory.',
      detectedAt: new Date('2024-06-03T10:30:00Z').toISOString(),
    },
    {
      id: '2',
      companyId: '2',
      company: { id: '2', name: 'BioInnovate Ltd.', domain: 'bioinnovate.com' },
      type: 'partnership',
      title: 'Strategic Partnership with Pharma Giant',
      description: 'BioInnovate announced a multi-year research collaboration with Johnson & Johnson to develop novel cancer therapeutics.',
      source: 'BioPharma Dive',
      url: 'https://biopharma.com/partnership-news',
      severity: 'high',
      tags: ['partnership', 'pharma', 'oncology'],
      summary: 'Major validation of platform technology through big pharma partnership.',
      detectedAt: new Date('2024-06-02T14:20:00Z').toISOString(),
    },
    {
      id: '3',
      companyId: '1',
      company: { id: '1', name: 'TechCorp Inc.', domain: 'techcorp.com' },
      type: 'hiring',
      title: 'Aggressive Hiring in AI Division',
      description: 'TechCorp has posted 25+ AI engineering and data science positions across multiple locations in the past 3 weeks.',
      source: 'LinkedIn',
      severity: 'medium',
      tags: ['hiring', 'ai', 'expansion'],
      summary: 'Rapid team expansion suggests new AI product development or significant platform scaling.',
      detectedAt: new Date('2024-06-01T09:15:00Z').toISOString(),
    },
    {
      id: '4',
      companyId: '3',
      company: { id: '3', name: 'GreenEnergy Solutions', domain: 'greenenergy.com' },
      type: 'risk',
      title: 'Regulatory Investigation Announced',
      description: 'EPA announced investigation into GreenEnergy\'s manufacturing processes following environmental compliance concerns.',
      source: 'Environmental Reporter',
      url: 'https://envreporter.com/investigation',
      severity: 'high',
      tags: ['regulatory', 'environmental', 'investigation'],
      summary: 'Regulatory risk could impact operations and future growth plans.',
      detectedAt: new Date('2024-05-31T16:45:00Z').toISOString(),
    },
    {
      id: '5',
      companyId: '2',
      company: { id: '2', name: 'BioInnovate Ltd.', domain: 'bioinnovate.com' },
      type: 'product',
      title: 'Phase II Trial Results Published',
      description: 'Positive Phase II results for lead cancer drug candidate published in Nature Medicine, showing 65% response rate.',
      source: 'Nature Medicine',
      url: 'https://nature.com/articles/trial-results',
      severity: 'high',
      tags: ['clinical', 'oncology', 'results'],
      summary: 'Strong clinical data supports advancement to Phase III and potential partnership opportunities.',
      detectedAt: new Date('2024-05-30T11:30:00Z').toISOString(),
    },
  ];

  const severityOptions = ['low', 'medium', 'high', 'critical'];
  const typeOptions = ['funding', 'hiring', 'risk', 'partnership', 'product', 'other'];
  // Filter signals based on current filters
  const filteredSignals = signals.filter((signal: Signal & { company: Pick<Company, 'id' | 'name' | 'domain'> }) => {
    if (filters.severity.length > 0 && !filters.severity.includes(signal.severity)) {
      return false;
    }
    if (filters.type.length > 0 && !filters.type.includes(signal.type)) {
      return false;
    }
    if (filters.search && !signal.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !signal.company.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const toggleFilter = (category: 'severity' | 'type', value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ClockIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Signal Alerts</h1>
          <p className="text-gray-600">Real-time intelligence on portfolio companies</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <Input
                placeholder="Search signals or companies..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <div className="flex flex-wrap gap-2">
                  {severityOptions.map((severity) => (
                    <button
                      key={severity}
                      onClick={() => toggleFilter('severity', severity)}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        filters.severity.includes(severity)
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signal Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleFilter('type', type)}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        filters.type.includes(type)
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {getSignalTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSignals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No signals found</h3>
                <p className="text-gray-500">Try adjusting your filters or check back later for new alerts.</p>
              </CardContent>
            </Card>
          ) : (
            filteredSignals.map((signal: Signal & { company: Pick<Company, 'id' | 'name' | 'domain'> }, index: number) => (
              <Card key={signal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{getSignalTypeIcon(signal.type)}</span>
                      </div>
                      {index < filteredSignals.length - 1 && (
                        <div className="w-px h-16 bg-gray-200 mt-4"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getSeverityColor(signal.severity)}>
                              {signal.severity}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatRelativeTime(signal.detectedAt)}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {signal.title}
                          </h3>
                          
                          <div className="mb-2">
                            <Link
                              href={`/company/${signal.company.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {signal.company.name}
                            </Link>
                            <span className="text-gray-500 ml-2">({signal.company.domain})</span>
                          </div>
                          
                          <p className="text-gray-700 mb-3">
                            {signal.description}
                          </p>
                          
                          {signal.summary && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                              <p className="text-sm text-blue-800 italic">
                                <strong>AI Analysis:</strong> {signal.summary}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {signal.tags?.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>Source: {signal.source}</span>
                              <span>•</span>
                              <span>{formatDate(signal.detectedAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {signal.url && (
                          <Link
                            href={signal.url}
                            target="_blank"
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600"
                          >
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Load More */}
      {filteredSignals.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Signals
          </Button>
        </div>
      )}
    </div>
  );
}
