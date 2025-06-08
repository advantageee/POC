'use client';

import { CompanyProfile } from '@/components/dashboard/CompanyProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { notFound } from 'next/navigation';

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  // In a real app, you'd fetch company data here
  // For now, we'll pass the ID to the component
  const { id } = await params;
  
  if (!id) {
    notFound();
  }
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CompanyProfile companyId={id} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
