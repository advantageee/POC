'use client';

import { ExportCenter } from '@/components/export/ExportCenter';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ExportsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Export Center</h1>
            <p className="text-gray-600">Generate and download reports in PDF or CSV format</p>
          </div>
          <ExportCenter />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
