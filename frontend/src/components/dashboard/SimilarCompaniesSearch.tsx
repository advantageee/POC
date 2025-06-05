'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import type { SimilarCompany, Company } from '@/types';

interface SimilarCompaniesSearchProps {
  targetCompany?: Company;
  similarCompanies?: SimilarCompany[];
  loading?: boolean;
  onSearch?: (query: string) => void;
}

export function SimilarCompaniesSearch({
  targetCompany,
  similarCompanies = [],
  loading = false,
  onSearch,
}: SimilarCompaniesSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Mock data
  const mockTargetCompany: Company = targetCompany || {
    id: '1',
    name: 'TechCorp Inc.',
    domain: 'techcorp.com',
    industry: 'Software',
    headcount: 250,
    fundingStage: 'Series B',
    summary: 'AI-powered enterprise software solutions for data analytics and business intelligence.',
    investmentScore: 85,
    tags: ['AI', 'Enterprise', 'SaaS', 'Analytics'],
    riskFlags: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-01'),
  };

  const mockSimilarCompanies: SimilarCompany[] = similarCompanies.length > 0 ? similarCompanies : [
    {
      id: '2',
      name: 'DataFlow Systems',
      domain: 'dataflow.com',
      industry: 'Software',
      similarity: 0.92,
      summary: 'Enterprise data platform with advanced analytics and AI-driven insights.',
      investmentScore: 78,
    },
    {
      id: '3',
      name: 'IntelliMetrics Pro',
      domain: 'intellimetrics.com',
      industry: 'Software',
      similarity: 0.88,
      summary: 'Business intelligence platform focusing on real-time analytics and visualization.',
      investmentScore: 82,
    },
    {
      id: '4',
      name: 'Neural Analytics Corp',
      domain: 'neuralanalytics.com',
      industry: 'Software',
      similarity: 0.85,
      summary: 'AI-first analytics platform for enterprise decision making and automation.',
      investmentScore: 71,
    },
    {
      id: '5',
      name: 'SmartData Solutions',
      domain: 'smartdata.com',
      industry: 'Software',
      similarity: 0.83,
      summary: 'Cloud-based data analytics and business intelligence for mid-market companies.',
      investmentScore: 69,
    },
    {
      id: '6',
      name: 'QuantumBI',
      domain: 'quantumbi.com',
      industry: 'Software',
      similarity: 0.79,
      summary: 'Next-generation business intelligence with quantum-inspired algorithms.',
      investmentScore: 88,
    },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim() || !onSearch) return;

    setIsSearching(true);
    try {
      await onSearch(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return 'text-green-600 bg-green-50';
    if (similarity >= 0.8) return 'text-blue-600 bg-blue-50';
    if (similarity >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.9) return 'Very High';
    if (similarity >= 0.8) return 'High';
    if (similarity >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Similar Companies</h1>
        <p className="text-gray-600">Find companies with similar profiles using AI-powered matching</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-blue-500" />
            AI-Powered Search
          </CardTitle>
          <CardDescription>
            Enter a company description or paste company information to find similar organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter company description, technology stack, business model, or paste company information..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                loading={isSearching}
                disabled={!searchQuery.trim() || isSearching}
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="text-sm text-gray-500">
              <strong>Example:</strong> "AI-powered enterprise software for data analytics with machine learning capabilities, Series B stage, 200+ employees"
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Company (if searching from company page) */}
      {targetCompany && (
        <Card>
          <CardHeader>
            <CardTitle>Target Company</CardTitle>
            <CardDescription>Finding companies similar to this profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{mockTargetCompany.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{mockTargetCompany.domain}</p>
                <p className="text-gray-700 mb-3">{mockTargetCompany.summary}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{mockTargetCompany.industry}</Badge>
                  <Badge variant="secondary">{mockTargetCompany.fundingStage}</Badge>
                  {mockTargetCompany.headcount && (
                    <Badge variant="secondary">{formatNumber(mockTargetCompany.headcount)} employees</Badge>
                  )}
                  {mockTargetCompany.tags?.map((tag) => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : mockSimilarCompanies.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Similar Companies</h2>
            <span className="text-sm text-gray-500">
              {mockSimilarCompanies.length} companies found
            </span>
          </div>

          <div className="grid gap-4">
            {mockSimilarCompanies.map((company, index) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSimilarityColor(company.similarity)}`}>
                          {getSimilarityLabel(company.similarity)} ({Math.round(company.similarity * 100)}%)
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-1">
                        <Link
                          href={`/companies/${company.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {company.name}
                        </Link>
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-2">{company.domain}</p>
                      
                      {company.summary && (
                        <p className="text-gray-700 mb-3">{company.summary}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary">{company.industry}</Badge>
                          {company.investmentScore && (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-gray-500">Score:</span>
                              <span className="font-medium text-blue-600">
                                {company.investmentScore}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/companies/${company.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline">
              Load More Results
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
            <p className="text-gray-500">
              Use the search above to find companies similar to your criteria using our AI-powered matching algorithm.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
