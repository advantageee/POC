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
  phone?: string;
  location?: string;
  linkedInUrl?: string;
  linkedinUrl?: string;
  company?: string;
  persona?: string;
  summary?: string;
  tags?: string[];
  notes?: string;
  lastContactedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
  detectedAt: string;
  processedAt?: string;
  confidence?: number;
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
  type?: 'companies' | 'signals';
  format?: 'csv' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

// User roles enum for type safety
export type UserRole = 'Admin' | 'Analyst' | 'Viewer';

// User preferences interface
export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  defaultView: 'companies' | 'dashboard' | 'signals';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string; // For backwards compatibility
  roles?: UserRole[]; // New array-based roles
  avatar?: string;
  lastLogin?: Date;
  preferences?: UserPreferences;
  createdAt?: Date;
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

export interface MCPEntry {
  id: string;
  headline: string;
  summary: string;
  link: string;
  publishedAt: string;
  source: string;
  topics: string[];
  confidence: number;
}

export interface MCPContext {
  id: string;
  title: string;
  timestamp: string;
  entries: MCPEntry[];
}
