export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  headcount?: number;
  fundingStage?: string;
  summary?: string;
  investmentScore?: number;
  tags?: string[];
  riskFlags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  title: string;
  email?: string;
  linkedInUrl?: string;
  persona?: string;
  summary?: string;
}

export interface Investment {
  id: string;
  companyId: string;
  company: string;
  filingType: string;
  filingDate: Date;
  source: string;
  url: string;
  summary: string;
  investmentScore: number;
  amount?: number;
  currency?: string;
  round?: string;
}

export interface Signal {
  id: string;
  companyId: string;
  type: 'funding' | 'hiring' | 'risk' | 'partnership' | 'product' | 'other';
  title: string;
  description: string;
  source: string;
  url?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  summary?: string;
  detectedAt: Date;
  processedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'viewer' | 'analyst' | 'admin';
  permissions: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CompanyFilters {
  search?: string;
  industry?: string[];
  fundingStage?: string[];
  headcountMin?: number;
  headcountMax?: number;
  investmentScoreMin?: number;
  investmentScoreMax?: number;
  tags?: string[];
  riskFlags?: string[];
}

export interface ExportRequest {
  type: 'pdf' | 'csv';
  filters?: CompanyFilters;
  companyIds?: string[];
  includeContacts?: boolean;
  includeInvestments?: boolean;
  includeSignals?: boolean;
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: 'pdf' | 'csv';
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface SimilarCompany {
  id: string;
  name: string;
  domain: string;
  industry: string;
  similarity: number;
  summary?: string;
  investmentScore?: number;
}
