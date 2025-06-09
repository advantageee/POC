'use client';

import { ExportCenter } from '@/components/export/ExportCenter';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ExportsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Export Center</h1>
              <p className="text-gray-600">Generate and download reports in PDF or CSV format</p>
            </div>
            <ExportCenter />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
