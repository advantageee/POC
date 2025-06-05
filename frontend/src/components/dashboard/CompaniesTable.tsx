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
import type { Company, CompanyFilters, PaginatedResponse } from '@/types';

interface CompaniesTableProps {
  companies?: PaginatedResponse<Company>;
  loading?: boolean;
  onFiltersChange?: (filters: CompanyFilters) => void;
  onPageChange?: (page: number) => void;
}

export function CompaniesTable({ 
  companies, 
  loading = false, 
  onFiltersChange, 
  onPageChange 
}: CompaniesTableProps) {
  const [filters, setFilters] = useState<CompanyFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof CompanyFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleSearch = (search: string) => {
    handleFilterChange('search', search);
  };

  const getInvestmentScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const mockCompanies: PaginatedResponse<Company> = companies || {
    data: [
      {
        id: '1',
        name: 'TechCorp Inc.',
        domain: 'techcorp.com',
        industry: 'Software',
        headcount: 250,
        fundingStage: 'Series B',
        summary: 'AI-powered enterprise software solutions',
        investmentScore: 85,
        tags: ['AI', 'Enterprise', 'SaaS'],
        riskFlags: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-06-01'),
      },
      {
        id: '2',
        name: 'BioInnovate Ltd.',
        domain: 'bioinnovate.com',
        industry: 'Biotechnology',
        headcount: 85,
        fundingStage: 'Series A',
        summary: 'Novel drug discovery platform',
        investmentScore: 72,
        tags: ['Biotech', 'Drug Discovery'],
        riskFlags: ['Regulatory Risk'],
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-05-28'),
      },
      {
        id: '3',
        name: 'GreenEnergy Solutions',
        domain: 'greenenergy.com',
        industry: 'Clean Energy',
        headcount: 120,
        fundingStage: 'Seed',
        summary: 'Solar panel manufacturing and installation',
        investmentScore: 65,
        tags: ['Clean Energy', 'Manufacturing'],
        riskFlags: [],
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-06-02'),
      },
    ],
    total: 156,
    page: 1,
    pageSize: 20,
    totalPages: 8,
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Companies</CardTitle>
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
                {mockCompanies.data.map((company) => (
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
                        {company.tags?.slice(0, 2).map((tag) => (
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((mockCompanies.page - 1) * mockCompanies.pageSize) + 1} to{' '}
          {Math.min(mockCompanies.page * mockCompanies.pageSize, mockCompanies.total)} of{' '}
          {mockCompanies.total} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(mockCompanies.page - 1)}
            disabled={mockCompanies.page === 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {mockCompanies.page} of {mockCompanies.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(mockCompanies.page + 1)}
            disabled={mockCompanies.page === mockCompanies.totalPages}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
