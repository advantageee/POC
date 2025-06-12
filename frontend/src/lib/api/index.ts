import { api } from './client';
import type {
  Company,
  Contact,
  Investment,
  Signal,
  PaginatedResponse,
  CompanyFilters,
  ExportRequest,
  ExportJob,
  SimilarCompany,
  MCPContext,
  User,
} from '@/types';

export const companiesApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    filters?: CompanyFilters;
  }): Promise<PaginatedResponse<Company>> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.set(key, value.toString());
          }
        }
      });
    }
    
    return api.get(`/api/companies?${searchParams.toString()}`);
  },

  getById: (id: string): Promise<Company> =>
    api.get(`/api/companies/${id}`),

  create: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> =>
    api.post('/api/companies', company),

  update: (id: string, company: Partial<Company>): Promise<Company> =>
    api.put(`/api/companies/${id}`, company),

  delete: (id: string): Promise<void> =>
    api.delete(`/api/companies/${id}`),

  getContacts: (companyId: string): Promise<Contact[]> =>
    api.get(`/api/companies/${companyId}/contacts`),

  getInvestments: (companyId: string): Promise<Investment[]> =>
    api.get(`/api/companies/${companyId}/investments`),

  getSignals: (companyId: string): Promise<Signal[]> =>
    api.get(`/api/companies/${companyId}/signals`),

  getSimilar: (companyId: string, limit?: number): Promise<SimilarCompany[]> =>
    api.get(`/api/companies/${companyId}/similar${limit ? `?limit=${limit}` : ''}`),
};

export const signalsApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    companyId?: string;
    types?: string[];
    severities?: string[];
    minConfidence?: number;
  }): Promise<PaginatedResponse<Signal>> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.companyId) searchParams.set('companyId', params.companyId);
    if (params?.minConfidence) searchParams.set('minConfidence', params.minConfidence.toString());
    if (params?.types?.length) {
      params.types.forEach(type => searchParams.append('types', type));
    }
    if (params?.severities?.length) {
      params.severities.forEach(severity => searchParams.append('severities', severity));
    }
    
    return api.get(`/api/signals?${searchParams.toString()}`);
  },

  getById: (id: string): Promise<Signal> =>
    api.get(`/api/signals/${id}`),

  create: (signal: Omit<Signal, 'id' | 'detectedAt' | 'processedAt'>): Promise<Signal> =>
    api.post('/api/signals', signal),

  update: (id: string, signal: Partial<Signal>): Promise<Signal> =>
    api.put(`/api/signals/${id}`, signal),

  delete: (id: string): Promise<void> =>
    api.delete(`/api/signals/${id}`),

  refresh: (): Promise<void> =>
    api.post('/api/signals/refresh'),
};

export const exportApi = {
  createJob: (request: ExportRequest): Promise<ExportJob> =>
    api.post('/api/export', request),

  getJob: (jobId: string): Promise<ExportJob> =>
    api.get(`/api/export/${jobId}`),

  getJobs: (): Promise<ExportJob[]> =>
    api.get('/api/export/jobs'),
};

export const embeddingApi = {
  search: (query: string, filters?: Record<string, any>): Promise<SimilarCompany[]> => {
    const searchParams = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, value.toString());
        }
      });
    }
    return api.get(`/api/embedding/search?${searchParams.toString()}`);
  },
};

export const contactsApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    companyId?: string;
  }): Promise<PaginatedResponse<Contact>> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.companyId) searchParams.set('companyId', params.companyId);
    
    return api.get(`/api/contacts?${searchParams.toString()}`);
  },

  getById: (id: string): Promise<Contact> =>
    api.get(`/api/contacts/${id}`),

  create: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> =>
    api.post('/api/contacts', contact),

  update: (id: string, contact: Partial<Contact>): Promise<Contact> =>
    api.put(`/api/contacts/${id}`, contact),

  delete: (id: string): Promise<void> =>
    api.delete(`/api/contacts/${id}`),
};

export const contextApi = {
  get: (id: string): Promise<MCPContext> => api.get(`/context?id=${id}`),
};

export const usersApi = {
  getAll: (): Promise<User[]> => api.get('/api/users'),
  getById: (id: string): Promise<User> => api.get(`/api/users/${id}`),
  create: (user: Partial<User>): Promise<User> => api.post('/api/users', user),
  update: (id: string, user: Partial<User>): Promise<User> =>
    api.put(`/api/users/${id}`, user),
  delete: (id: string): Promise<void> => api.delete(`/api/users/${id}`),
};
