'use client';

import { SimilarCompaniesSearch } from '@/components/dashboard/SimilarCompaniesSearch';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Similar Companies</h1>
            <p className="text-gray-600">Find companies similar to your portfolio using AI analysis</p>
          </div>
          <SimilarCompaniesSearch />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
