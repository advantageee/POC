'use client';

import { CompanyProfile } from '@/components/dashboard/CompanyProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { notFound } from 'next/navigation';
import { use } from 'react';

export default function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  // In a real app, you'd fetch company data here
  // For now, we'll pass the ID to the component
  const { id } = use(params);
  
  if (!id) {
    notFound();
  }
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CompanyProfile companyId={id} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
