'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate, formatNumber, getSeverityColor, getSignalTypeIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { companiesApi } from '@/lib/api';
import type { Company, Contact, Investment, Signal } from '@/types';

interface CompanyProfileProps {
  companyId: string;
}

const tabs = [
  { id: 'overview', name: 'Overview', icon: BuildingOfficeIcon },
  { id: 'signals', name: 'Signals', icon: ExclamationTriangleIcon },
  { id: 'contacts', name: 'Contacts', icon: UsersIcon },
  { id: 'investments', name: 'Investments', icon: ChartBarIcon },
];

export function CompanyProfile({ companyId }: CompanyProfileProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'investments' | 'signals'>('overview');

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch company details
        const companyData = await companiesApi.getById(companyId);
        setCompany(companyData);

        // Fetch related data
        const [contactsData, investmentsData, signalsData] = await Promise.allSettled([
          companiesApi.getContacts(companyId),
          companiesApi.getInvestments(companyId),
          companiesApi.getSignals(companyId),
        ]);

        if (contactsData.status === 'fulfilled') {
          setContacts(contactsData.value);
        }
        if (investmentsData.status === 'fulfilled') {
          setInvestments(investmentsData.value);
        }
        if (signalsData.status === 'fulfilled') {
          setSignals(signalsData.value);
        }
      } catch (err) {
        console.error('Failed to fetch company data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error || 'Company not found'}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{company.name}</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Domain</dt>
                  <dd className="text-sm text-gray-900">{company.domain}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Industry</dt>
                  <dd className="text-sm text-gray-900">{company.industry}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Funding Stage</dt>
                  <dd>
                    <Badge variant="secondary">{company.fundingStage}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Headcount</dt>
                  <dd className="text-sm text-gray-900">
                    {company.headcount ? formatNumber(company.headcount) : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h4 className="text-md font-medium mb-4">Investment Score</h4>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-blue-600">
                  {company.investmentScore || 'N/A'}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${company.investmentScore || 0}%` }}
                    />
                  </div>
                </div>
              </div>
              {company.summary && (
                <div className="mt-4">
                  <h4 className="text-md font-medium mb-2">Summary</h4>
                  <p className="text-sm text-gray-600">{company.summary}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags and Risk Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {company.tags?.map((tag: string) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              )) || <span className="text-gray-500 text-sm">No tags</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {company.riskFlags?.map((flag: string) => (
                <Badge key={flag} variant="destructive">
                  {flag}
                </Badge>
              )) || <span className="text-gray-500 text-sm">No risk flags</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSignals = () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Signals</CardTitle>
        <CardDescription>AI-detected events and activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {signals.length > 0 ? (
            signals.map((signal) => (
              <div key={signal.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getSignalTypeIcon(signal.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{signal.title}</h4>
                        <Badge className={getSeverityColor(signal.severity)}>
                          {signal.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{signal.description}</p>
                      {signal.summary && (
                        <p className="text-sm text-blue-600 italic">{signal.summary}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Source: {signal.source}</span>
                        <span>{formatDate(signal.detectedAt)}</span>
                      </div>
                    </div>
                  </div>
                  {signal.url && (
                    <Link
                      href={signal.url}
                      target="_blank"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No signals available for this company</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderContacts = () => (
    <Card>
      <CardHeader>
        <CardTitle>Key Contacts</CardTitle>
        <CardDescription>Decision makers and key personnel</CardDescription>
      </CardHeader>
      <CardContent>
        {contacts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Persona</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{contact.persona}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {contact.email && (
                        <Link
                          href={`mailto:${contact.email}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Email
                        </Link>
                      )}
                      {contact.linkedInUrl && (
                        <Link
                          href={contact.linkedInUrl}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          LinkedIn
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 text-center py-8">No contacts available for this company</p>
        )}
      </CardContent>
    </Card>
  );

  const renderInvestments = () => (
    <Card>
      <CardHeader>
        <CardTitle>Investment History</CardTitle>
        <CardDescription>Funding rounds and financial filings</CardDescription>
      </CardHeader>
      <CardContent>
        {investments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Round</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell>
                    <Badge variant="secondary">{investment.round}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(investment.filingDate)}</TableCell>
                  <TableCell>
                    {investment.amount && investment.currency
                      ? `${investment.currency} ${formatNumber(investment.amount)}`
                      : 'Undisclosed'}
                  </TableCell>
                  <TableCell>{investment.source}</TableCell>
                  <TableCell>
                    <span className="font-medium text-blue-600">
                      {investment.investmentScore}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 text-center py-8">No investment data available for this company</p>
        )}
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'signals':
        return renderSignals();
      case 'contacts':
        return renderContacts();
      case 'investments':
        return renderInvestments();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
        <p className="text-gray-600">{company.domain}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>      {/* Content */}
      {renderContent()}
    </div>
  );
}
