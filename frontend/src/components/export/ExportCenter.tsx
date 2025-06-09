'use client';

import React, { useState, useEffect } from 'react';
import { formatDate, formatRelativeTime, generateExportFilename } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  DocumentArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { exportApi } from '@/lib/api';
import type { ExportRequest, ExportJob, CompanyFilters } from '@/types';

interface ExportCenterProps {
  className?: string;
}

export function ExportCenter({ className }: ExportCenterProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [dataType, setDataType] = useState<'companies' | 'signals'>('companies');
  const [filters, setFilters] = useState<CompanyFilters>({});
  const [includeOptions, setIncludeOptions] = useState({
    contacts: true,
    investments: true,
    signals: true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Load export jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await exportApi.getJobs();
        setJobs(data);
      } catch (err) {
        console.error('Failed to load export jobs:', err);
        setError('Failed to load export jobs');
        setJobs([]); // Show empty list instead of mock data
      } finally {
        setLoading(false);
      }
    };

    loadJobs();  }, []);

  const handleCreateExport = async () => {
    setIsCreating(true);
    try {
      const request: ExportRequest = {
        format: exportFormat,
        type: dataType,
        filters,
      };
      
      const newJob = await exportApi.createJob(request);
      setJobs(prev => [newJob, ...prev]);
      
      // Reset form
      setFilters({});
      setIncludeOptions({
        contacts: true,
        investments: true,
        signals: true,
      });
    } catch (err) {
      console.error('Failed to create export:', err);
      setError('Failed to create export job');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
      case 'pending':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Center</h1>
        <p className="text-gray-600">Generate reports and export data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Export */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Export</CardTitle>
            <CardDescription>
              Generate PDF reports or CSV data exports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    exportFormat === 'pdf'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <DocumentArrowDownIcon className="h-6 w-6 mb-2 text-red-500" />
                  <div className="font-medium">PDF Report</div>
                  <div className="text-sm text-gray-500">
                    Formatted company profiles and analysis
                  </div>
                </button>
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    exportFormat === 'csv'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <DocumentArrowDownIcon className="h-6 w-6 mb-2 text-green-500" />
                  <div className="font-medium">CSV Data</div>
                  <div className="text-sm text-gray-500">
                    Raw data for analysis tools
                  </div>
                </button>
              </div>
            </div>

            {/* Data Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDataType('companies')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    dataType === 'companies'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Companies</div>
                  <div className="text-sm text-gray-500">
                    Company profiles and details
                  </div>
                </button>
                <button
                  onClick={() => setDataType('signals')}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    dataType === 'signals'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Signals</div>
                  <div className="text-sm text-gray-500">
                    Investment signals and alerts
                  </div>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <h3 className="font-medium">Filters</h3>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Industry"
                  placeholder="Filter by industry"
                  value={filters.industry?.[0] || ''}
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      industry: e.target.value ? [e.target.value] : undefined,
                    }))
                  }
                />
                <Input
                  label="Funding Stage"
                  placeholder="Filter by stage"
                  value={filters.fundingStage?.[0] || ''}
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      fundingStage: e.target.value ? [e.target.value] : undefined,
                    }))
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min Investment Score"
                    type="number"
                    placeholder="0-100"
                    value={filters.investmentScoreMin || ''}
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        investmentScoreMin: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                  <Input
                    label="Max Investment Score"
                    type="number"
                    placeholder="0-100"
                    value={filters.investmentScoreMax || ''}
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        investmentScoreMax: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Include Options */}
            <div className="space-y-3">
              <h3 className="font-medium">Include Data</h3>
              <div className="space-y-2">
                {[
                  { key: 'contacts', label: 'Contact Information', description: 'Key personnel and decision makers' },
                  { key: 'investments', label: 'Investment History', description: 'Funding rounds and financial data' },
                  { key: 'signals', label: 'Recent Signals', description: 'AI-detected events and activities' },
                ].map((option) => (
                  <label key={option.key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeOptions[option.key as keyof typeof includeOptions]}
                      onChange={(e) =>
                        setIncludeOptions(prev => ({
                          ...prev,
                          [option.key]: e.target.checked,
                        }))
                      }
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateExport}
              loading={isCreating}
              className="w-full"            disabled={isCreating}
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Create {exportFormat.toUpperCase()} Export
            </Button>
          </CardContent>
        </Card>

        {/* Recent Exports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
            <CardDescription>
              Your export history and download links
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center p-8">
                <DocumentArrowDownIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No exports yet</h3>
                <p className="text-gray-500">Create your first export to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>                      <TableCell>                        <div className="flex flex-col space-y-1">
                          <Badge variant="secondary">
                            {job.type?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                          <Badge variant="default">
                            {job.format?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          <Badge variant={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{formatRelativeTime(job.createdAt)}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(job.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.status === 'completed' && job.downloadUrl ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(job.downloadUrl, '_blank')}
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        ) : job.status === 'failed' ? (
                          <div className="text-xs text-red-600" title={job.error}>
                            Failed
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            Processing...
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
