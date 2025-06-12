'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  UserGroupIcon,
  ChartBarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
  { name: 'Companies', href: '/companies', icon: BuildingOfficeIcon },
  { name: 'Contacts', href: '/contacts', icon: UsersIcon },
  { name: 'Alerts', href: '/alerts', icon: ExclamationTriangleIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
  { name: 'Export', href: '/exports', icon: DocumentArrowDownIcon },
];

const adminNavigation = [
  { name: 'User Management', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden animate-fade-in"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">IC</span>
              </div>
            </div>
            <div>
              <h1 className="text-headline font-semibold text-gray-900">Investor Codex</h1>
              <p className="text-caption-1 text-gray-500">Investment Intelligence</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      // Close mobile sidebar when navigating
                      if (isOpen) onToggle();
                    }}
                    className={cn(
                      'group flex items-center px-4 py-3 text-callout font-medium rounded-xl transition-all duration-200 interactive',
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <Icon 
                      className={cn(
                        'mr-4 h-6 w-6 transition-colors',
                        isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                      )} 
                    />
                    {item.name}
                    {isActive && (
                      <div className="ml-auto w-1 h-1 bg-white rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Admin Section */}
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </h3>
            <ul className="mt-4 space-y-2">
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        // Close mobile sidebar when navigating
                        if (isOpen) onToggle();
                      }}
                      className={cn(
                        'group flex items-center px-4 py-3 text-callout font-medium rounded-xl transition-all duration-200 interactive',
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      )}
                    >
                      <Icon 
                        className={cn(
                          'mr-4 h-6 w-6 transition-colors',
                          isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                        )} 
                      />
                      {item.name}
                      {isActive && (
                        <div className="ml-auto w-1 h-1 bg-white rounded-full" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-caption-2 text-gray-500">Version 1.0.0</p>
            <p className="text-caption-2 text-gray-400">© 2025 Investor Codex</p>
          </div>
        </div>
      </div>
    </>
  );
}
