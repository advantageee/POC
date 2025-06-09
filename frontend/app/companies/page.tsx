'use client';

import { CompaniesTable } from '@/components/dashboard/CompaniesTable';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CompaniesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
              <p className="text-gray-600">Manage and monitor your company portfolio</p>
            </div>
            <CompaniesTable />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
