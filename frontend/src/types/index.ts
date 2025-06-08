// Types for the Investor Codex platform

export interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  location?: string;
  headcount?: number;
  fundingStage?: string;
  summary?: string;
  investmentScore?: number;
  tags?: string[];
  riskFlags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyFilters {
  search?: string;
  industry?: string[];
  fundingStage?: string[];
  investmentScoreMin?: number;
  investmentScoreMax?: number;
  headcountMin?: number;
  headcountMax?: number;
  tags?: string[];
  riskFlags?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  title?: string;
  email?: string;
  linkedInUrl?: string;
  persona?: string;
  summary?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Investment {
  id: string;
  companyId: string;
  round?: string;
  amount?: number;
  currency?: string;
  filingDate: Date;
  source?: string;
  investmentScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Signal {
  id: string;
  companyId: string;
  type: string;
  title: string;
  description: string;
  source: string;
  url?: string;
  severity: 'low' | 'medium' | 'high';
  tags?: string[];
  summary?: string;
  detectedAt: Date;
  processedAt: Date;
}

export interface SimilarCompany {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  similarity: number;
  summary?: string;
  investmentScore?: number;
}

export interface ExportRequest {
  format: 'csv' | 'pdf';
  type: 'companies' | 'signals';
  filters?: any;
  fields?: string[];
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
  accessToken: string;
  refreshToken?: string;
}
