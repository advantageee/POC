'use client';

import React, { useState } from 'react';
import { Bars3Icon, BellIcon, UserCircleIcon, Cog6ToothIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { User } from '@/types';
import { useUser } from '@/components/auth/UserProvider';

interface HeaderProps {
  onMenuToggle: () => void;
  user?: User | null;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  return (
    <header className="bg-white border-b border-gray-200 h-16 glass-effect sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </Button>
          
          <div>
            <h2 className="text-title-3 font-semibold text-gray-900">
              Investment Dashboard
            </h2>
            <p className="text-caption-1 text-gray-500">
              Real-time market intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="hidden md:flex">
            <div className="relative">
              <input
                type="text"
                placeholder="Search companies..."
                className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="sr-only">Settings</span>
            <Cog6ToothIcon className="h-6 w-6" />
          </button>          {/* User menu */}
          <div className="relative flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-callout font-medium text-gray-900">{user.name}</p>
                  <p className="text-caption-2 text-gray-500 capitalize">{user.roles?.[0]?.toLowerCase() || user.role?.toLowerCase() || 'viewer'}</p>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-lg ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                    )}
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Profile
                        </a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Settings
                        </a>
                        <hr className="my-1" />
                        <button 
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Button size="sm" variant="primary">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
