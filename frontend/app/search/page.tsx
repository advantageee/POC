'use client';

import { useState, useEffect } from 'react';
import { companiesApi } from '@/lib/api';
import type { Company } from '@/types';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface SearchFilters {
  industry: string;
  fundingStage: string;
  location: string;
  minHeadcount: string;
  maxHeadcount: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    industry: '',
    fundingStage: '',
    location: '',
    minHeadcount: '',
    maxHeadcount: ''
  });
  const searchCompanies = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await companiesApi.getAll({
        page: 1,
        pageSize: 20,
        filters: {
          search: searchQuery,
          ...(filters.industry && { industry: [filters.industry] }),
          ...(filters.fundingStage && { fundingStage: [filters.fundingStage] }),
        }
      });
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCompanies();
  };

  const clearFilters = () => {
    setFilters({
      industry: '',
      fundingStage: '',
      location: '',
      minHeadcount: '',
      maxHeadcount: ''
    });
  };
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const response = await companiesApi.getAll({
          page: 1,
          pageSize: 20,
        });
        setCompanies(response.data || []);
      } catch (error) {
        console.error('Failed to load companies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600 bg-green-50';
    if (score >= 7.0) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatHeadcount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Company Intelligence Search
          </h1>
          <p className="text-gray-600">
            Discover and analyze investment opportunities with AI-powered search and real-time data
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <form onSubmit={handleSearch} className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies by name, industry, or keywords..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FunnelIcon className="h-4 w-4" />
                  <span>Filters</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      value={filters.industry}
                      onChange={(e) => setFilters({...filters, industry: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Industries</option>
                      <option value="Technology">Technology</option>
                      <option value="Software">Software</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="E-commerce">E-commerce</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Funding Stage
                    </label>
                    <select
                      value={filters.fundingStage}
                      onChange={(e) => setFilters({...filters, fundingStage: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Stages</option>
                      <option value="Pre-Seed">Pre-Seed</option>
                      <option value="Seed">Seed</option>
                      <option value="Series A">Series A</option>
                      <option value="Series B">Series B</option>
                      <option value="Series C+">Series C+</option>
                      <option value="Public">Public</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Employees
                    </label>
                    <input
                      type="number"
                      value={filters.minHeadcount}
                      onChange={(e) => setFilters({...filters, minHeadcount: e.target.value})}
                      placeholder="e.g. 50"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Employees
                    </label>
                    <input
                      type="number"
                      value={filters.maxHeadcount}
                      onChange={(e) => setFilters({...filters, maxHeadcount: e.target.value})}
                      placeholder="e.g. 1000"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="w-full text-sm text-gray-600 hover:text-gray-900 py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results ({companies.length} companies)
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Searching companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center">
              <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No companies found. Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {companies.map((company) => (
                <div key={company.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {company.name}
                          </h3>
                          <p className="text-sm text-blue-600 font-medium">
                            {company.domain}
                          </p>
                        </div>                        <div className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(company.investmentScore ?? 0)}`}>
                          Score: {company.investmentScore ?? 0}/10
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {company.summary}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <ChartBarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Industry:</span>
                          <span className="font-medium text-gray-900">{company.industry}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium text-gray-900">{company.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <UsersIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Employees:</span>
                          <span className="font-medium text-gray-900">{formatHeadcount(company.headcount ?? 0)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ArrowTrendingUpIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Stage:</span>
                          <span className="font-medium text-gray-900">{company.fundingStage}</span>
                        </div>
                      </div>

                      {company.tags && company.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {company.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>                    <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                      <a 
                        href={`/company/${company.id}`}
                        className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-block text-center"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
