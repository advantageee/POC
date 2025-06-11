'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { contactsApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import type { Contact, PaginatedResponse } from '@/types';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadContacts();
  }, [currentPage, searchQuery]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactsApi.getAll({
        page: currentPage,
        pageSize: 20,
        search: searchQuery || undefined,
      });
      
      setContacts(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Failed to load contacts:', err);
      setError('Failed to load contacts. Using fallback data.');
      // Use mock data as fallback
      setContacts(getMockContacts());
    } finally {
      setLoading(false);
    }
  };

  const getMockContacts = (): Contact[] => [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@techcorp.com',
      title: 'Chief Executive Officer',
      companyId: '1',
      company: 'TechCorp Inc.',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/sarahchen',
      tags: ['CEO', 'AI', 'Enterprise'],
      notes: 'Strong background in AI and enterprise software. Previously founded two successful startups.',
      lastContactedAt: new Date('2024-06-01T10:00:00Z').toISOString(),
      createdAt: new Date('2024-01-15T09:00:00Z').toISOString(),
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      email: 'michael@bioinnovate.com',
      title: 'Chief Technology Officer',
      companyId: '2',
      company: 'BioInnovate Ltd.',
      phone: '+1 (555) 234-5678',
      location: 'Boston, MA',
      linkedinUrl: 'https://linkedin.com/in/mrodriguez',
      tags: ['CTO', 'Biotech', 'Research'],
      notes: 'PhD in Molecular Biology from MIT. Expert in drug discovery platforms.',
      lastContactedAt: new Date('2024-05-28T14:30:00Z').toISOString(),
      createdAt: new Date('2024-02-10T11:15:00Z').toISOString(),
    },
    {
      id: '3',
      name: 'Emma Thompson',
      email: 'emma.thompson@greenenergy.com',
      title: 'VP of Business Development',
      companyId: '3',
      company: 'GreenEnergy Solutions',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      linkedinUrl: 'https://linkedin.com/in/emmathompson',
      tags: ['BD', 'Clean Energy', 'Partnerships'],
      notes: 'Leading partnerships with major utilities. Strong network in renewable energy sector.',
      lastContactedAt: new Date('2024-06-02T16:45:00Z').toISOString(),
      createdAt: new Date('2024-03-05T13:20:00Z').toISOString(),
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@techcorp.com',
      title: 'VP of Engineering',
      companyId: '1',
      company: 'TechCorp Inc.',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      linkedinUrl: 'https://linkedin.com/in/davidkim',
      tags: ['Engineering', 'AI', 'Machine Learning'],
      notes: 'Former Google engineer. Leading the AI platform development team.',
      lastContactedAt: new Date('2024-05-30T09:15:00Z').toISOString(),
      createdAt: new Date('2024-01-20T10:30:00Z').toISOString(),
    },
    {
      id: '5',
      name: 'Jennifer Wang',
      email: 'jennifer@bioinnovate.com',
      title: 'Chief Financial Officer',
      companyId: '2',
      company: 'BioInnovate Ltd.',
      phone: '+1 (555) 567-8901',
      location: 'Cambridge, MA',
      linkedinUrl: 'https://linkedin.com/in/jenniferwang',
      tags: ['CFO', 'Finance', 'IPO'],
      notes: 'MBA from Wharton. Previously CFO at two biotech companies that went public.',
      lastContactedAt: new Date('2024-06-03T11:00:00Z').toISOString(),
      createdAt: new Date('2024-02-15T14:45:00Z').toISOString(),
    },
  ];

  const handleSearch = () => {
    setCurrentPage(1);
    loadContacts();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return `${Math.floor(diffInHours / 168)}w ago`;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
                <p className="text-gray-600">Manage your professional network and relationships</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search contacts by name, company, or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={loading}>
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contacts Grid */}
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {contact.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{contact.title}</p>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                            <Link
                              href={`/company/${contact.companyId}`}
                              className="text-blue-600 hover:text-blue-800 truncate"
                            >
                              {contact.company}
                            </Link>
                          </div>

                          {contact.location && (
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              <span className="truncate">{contact.location}</span>
                            </div>
                          )}

                          <div className="space-y-1 mb-3">
                            {contact.email && (
                              <div className="flex items-center text-sm text-gray-500">
                                <EnvelopeIcon className="h-4 w-4 mr-1" />
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="text-blue-600 hover:text-blue-800 truncate"
                                >
                                  {contact.email}
                                </a>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center text-sm text-gray-500">
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                <a
                                  href={`tel:${contact.phone}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {contact.phone}
                                </a>
                              </div>
                            )}
                          </div>

                          {contact.tags && contact.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {contact.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {contact.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{contact.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {contact.notes && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {contact.notes}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Last contact: {contact.lastContactedAt ? formatRelativeTime(contact.lastContactedAt) : 'Never'}
                            </span>
                            <span>
                              Added: {formatDate(contact.createdAt || '')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {contacts.length === 0 && !loading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? 'Try adjusting your search criteria.' : 'Start building your network by adding contacts.'}
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Contact
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
