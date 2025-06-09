'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate, formatNumber, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { companiesApi } from '@/lib/api';
import type { Company, CompanyFilters, PaginatedResponse } from '@/types';

interface CompaniesTableProps {
  className?: string;
}

export function CompaniesTable({ className }: CompaniesTableProps) {
  const [companies, setCompanies] = useState<PaginatedResponse<Company> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CompanyFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  // Fetch companies data
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching companies from API...', {
          page: currentPage,
          pageSize,
          filters
        });
        
        const response = await companiesApi.getAll({
          page: currentPage,
          pageSize,
          filters,
        });
        
        console.log('✅ Companies API response:', response);
        setCompanies(response);      } catch (err) {
        console.error('❌ Failed to fetch companies from API:', err);
        setError(err instanceof Error ? err.message : 'Failed to load companies');
        setCompanies(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [currentPage, filters]);

  const handleFilterChange = (key: keyof CompanyFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (search: string) => {
    handleFilterChange('search', search);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const getInvestmentScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading companies...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error && !companies) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayData = companies || {
    data: [],
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>        <CardHeader>
          <div className="flex items-center justify-between">            <div className="flex items-center space-x-3">
              <CardTitle>Companies</CardTitle>
              {!loading && companies && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Live API Data ({companies.total} total)
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search companies..."
                className="pl-10"
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  label="Industry"
                  placeholder="Filter by industry"
                  value={filters.industry?.[0] || ''}
                  onChange={(e) => handleFilterChange('industry', e.target.value ? [e.target.value] : [])}
                />
                <Input
                  label="Funding Stage"
                  placeholder="Filter by stage"
                  value={filters.fundingStage?.[0] || ''}
                  onChange={(e) => handleFilterChange('fundingStage', e.target.value ? [e.target.value] : [])}
                />
                <Input
                  label="Min Investment Score"
                  type="number"
                  placeholder="0-100"
                  value={filters.investmentScoreMin || ''}
                  onChange={(e) => handleFilterChange('investmentScoreMin', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Headcount</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.data.map((company: Company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/companies/${company.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {company.name}
                        </Link>
                        <div className="text-sm text-gray-500">{company.domain}</div>
                      </div>
                    </TableCell>
                    <TableCell>{company.industry}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{company.fundingStage}</Badge>
                    </TableCell>
                    <TableCell>{company.headcount ? formatNumber(company.headcount) : '-'}</TableCell>
                    <TableCell>
                      <span className={cn('font-medium', getInvestmentScoreColor(company.investmentScore))}>
                        {company.investmentScore || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {company.tags?.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="default" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(company.tags?.length || 0) > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(company.tags?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(company.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">        <div className="text-sm text-gray-700">
          Showing {((displayData.page - 1) * displayData.pageSize) + 1} to{' '}
          {Math.min(displayData.page * displayData.pageSize, displayData.total)} of{' '}
          {displayData.total} results
        </div>
        <div className="flex items-center space-x-2">          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(displayData.page - 1)}
            disabled={displayData.page === 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {displayData.page} of {displayData.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(displayData.page + 1)}
            disabled={displayData.page === displayData.totalPages}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
