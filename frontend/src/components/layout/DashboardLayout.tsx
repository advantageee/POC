'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUser } from '@/components/auth/UserProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="lg:pl-64 transition-all duration-300">
        <Header onMenuToggle={toggleSidebar} user={user} />
        
        <main className="py-8 animate-slide-up">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
