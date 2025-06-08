// Re-export all types from the main types file for API compatibility
export * from './index';

// Additional API-specific types if needed
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}
