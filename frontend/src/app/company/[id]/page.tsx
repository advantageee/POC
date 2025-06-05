'use client';

import { CompanyProfile } from '@/components/dashboard/CompanyProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { notFound } from 'next/navigation';

export default function CompanyPage({ params }: { params: { id: string } }) {
  // In a real app, you'd fetch company data here
  // For now, we'll pass the ID to the component
  
  if (!params.id) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CompanyProfile companyId={params.id} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
