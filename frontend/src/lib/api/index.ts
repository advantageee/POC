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
    severity?: string[];
    type?: string[];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Signal & { company: Pick<Company, 'id' | 'name' | 'domain'> }>> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params?.severity) {
      params.severity.forEach(s => searchParams.append('severity', s));
    }
    if (params?.type) {
      params.type.forEach(t => searchParams.append('type', t));
    }
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
    
    return api.get(`/api/signals?${searchParams.toString()}`);
  },

  getById: (id: string): Promise<Signal> =>
    api.get(`/api/signals/${id}`),

  markAsRead: (id: string): Promise<void> =>
    api.put(`/api/signals/${id}/read`),
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
