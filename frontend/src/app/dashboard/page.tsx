'use client';

import { CompaniesTable } from '@/components/dashboard/CompaniesTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600">Manage and monitor your company portfolio</p>
          </div>
          <CompaniesTable />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
