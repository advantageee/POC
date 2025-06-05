'use client';

import { AlertsTimeline } from '@/components/dashboard/AlertsTimeline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alerts & Signals</h1>
            <p className="text-gray-600">Monitor important signals and market developments</p>
          </div>
          <AlertsTimeline />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
