'use client';

import React, { useState } from 'react';
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
import type { Company, Contact, Investment, Signal } from '@/types';

interface CompanyProfileProps {
  companyId: string;
}

// Mock function to fetch company data by ID
const fetchCompanyData = (id: string) => {
  // In a real app, this would be an API call
  const mockCompany: Company = {
    id,
    name: `Company ${id}`,
    domain: `company${id}.com`,
    industry: 'Technology Software',
    headcount: 2500,
    fundingStage: 'Series C',
    summary: `A leading technology company specializing in innovative software solutions. Company ${id} has been at the forefront of digital transformation, helping businesses modernize their operations through cutting-edge technology platforms.`,
    investmentScore: 85,
    tags: ['SaaS', 'Enterprise', 'AI/ML'],
    riskFlags: ['High Growth', 'Competitive Market'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  };

  const mockContacts: Contact[] = [
    {
      id: 'c1',
      companyId: id,
      name: 'Sarah Johnson',
      title: 'CEO & Founder',
      email: 'sarah.johnson@company.com',
      linkedInUrl: 'https://linkedin.com/in/sarahjohnson',
      persona: 'Decision Maker',
      summary: 'Experienced technology executive with 15+ years in enterprise software.'
    }
  ];
  const mockInvestments: Investment[] = [
    {
      id: 'i1',
      companyId: id,
      round: 'Series C',
      filingDate: new Date('2023-06-15'),
      source: 'SEDAR',
      investmentScore: 85,
      amount: 50000000,
      currency: 'USD'
    }
  ];

  const mockSignals: Signal[] = [
    {
      id: 's1',
      companyId: id,
      type: 'funding',
      title: 'New Funding Round Announced',
      description: 'Company announced a new $50M Series C funding round',
      source: 'TechCrunch',
      url: 'https://techcrunch.com/funding-news',
      severity: 'high',
      tags: ['funding', 'growth', 'investment'],
      summary: 'Strong investor interest indicates positive market sentiment',
      detectedAt: new Date('2024-01-10'),
      processedAt: new Date('2024-01-10')
    }
  ];

  return {
    company: mockCompany,
    contacts: mockContacts,
    investments: mockInvestments,
    signals: mockSignals
  };
};

const tabs = [
  { id: 'overview', name: 'Overview', icon: BuildingOfficeIcon },
  { id: 'signals', name: 'Signals', icon: ExclamationTriangleIcon },
  { id: 'contacts', name: 'Contacts', icon: UsersIcon },
  { id: 'investments', name: 'Investments', icon: ChartBarIcon },
];

export function CompanyProfile({ companyId }: CompanyProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch company data based on ID
  const { company, contacts = [], investments = [], signals = [] } = fetchCompanyData(companyId);

  // Mock data
  const mockContacts: Contact[] = contacts.length > 0 ? contacts : [
    {
      id: '1',
      companyId: company.id,
      name: 'John Smith',
      title: 'CEO',
      email: 'john.smith@techcorp.com',
      linkedInUrl: 'https://linkedin.com/in/johnsmith',
      persona: 'Decision Maker',
      summary: 'Experienced technology executive with 15+ years in enterprise software.',
    },
    {
      id: '2',
      companyId: company.id,
      name: 'Sarah Johnson',
      title: 'CTO',
      email: 'sarah.johnson@techcorp.com',
      linkedInUrl: 'https://linkedin.com/in/sarahjohnson',
      persona: 'Technical Leader',
      summary: 'Former Google engineer, specialist in AI and machine learning.',
    },
  ];
  const mockInvestments: Investment[] = investments.length > 0 ? investments : [
    {
      id: '1',
      companyId: company.id,
      round: 'Series B',
      filingDate: new Date('2024-03-15'),
      source: 'SEC',
      investmentScore: 85,
      amount: 25000000,
      currency: 'USD',
    },
    {
      id: '2',
      companyId: company.id,
      round: 'Series A',
      filingDate: new Date('2023-08-10'),
      source: 'SEDAR',
      investmentScore: 78,
      amount: 8000000,
      currency: 'USD',
    },
  ];

  const mockSignals: Signal[] = signals.length > 0 ? signals : [
    {
      id: '1',
      companyId: company.id,
      type: 'funding',
      title: 'Series C Funding Round Announced',
      description: 'Company announced $50M Series C funding round led by top-tier VC firm.',
      source: 'TechCrunch',
      url: 'https://techcrunch.com/funding-news',
      severity: 'high',
      tags: ['funding', 'growth'],
      summary: 'Significant funding milestone indicating strong growth trajectory.',
      detectedAt: new Date('2024-05-20'),
      processedAt: new Date('2024-05-20'),
    },
    {
      id: '2',
      companyId: company.id,
      type: 'hiring',
      title: 'Aggressive Hiring in AI Division',
      description: 'Company has posted 15+ AI engineering positions in the past month.',
      source: 'LinkedIn',
      severity: 'medium',
      tags: ['hiring', 'ai', 'expansion'],
      summary: 'Rapid team expansion suggests new AI product development.',
      detectedAt: new Date('2024-05-18'),
      processedAt: new Date('2024-05-18'),
    },
    {
      id: '3',
      companyId: company.id,
      type: 'risk',
      title: 'Key Executive Departure',
      description: 'VP of Engineering announced departure after 3 years with the company.',
      source: 'Company Blog',
      url: 'https://techcorp.com/blog/leadership-update',
      severity: 'medium',
      tags: ['leadership', 'departure'],
      summary: 'Leadership change may impact technical roadmap.',
      detectedAt: new Date('2024-05-15'),
      processedAt: new Date('2024-05-15'),
    },
  ];

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
          {mockSignals.map((signal) => (
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
          ))}
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
            {mockContacts.map((contact) => (
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
            {mockInvestments.map((investment) => (
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
                onClick={() => setActiveTab(tab.id)}
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
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
