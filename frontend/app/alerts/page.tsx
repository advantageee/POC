'use client';

import { AlertsTimeline } from '@/components/dashboard/AlertsTimeline';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alerts & Signals</h1>
              <p className="text-gray-600">Monitor important signals and market developments</p>
            </div>
            <AlertsTimeline />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
