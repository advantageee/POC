'use client';

import Link from 'next/link';
import { 
  ExclamationTriangleIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="h-10 w-10 text-red-600" aria-hidden="true" />
            </div>
            
            {/* Error Code */}
            <h1 className="mt-6 text-6xl font-bold text-gray-900">404</h1>
            
            {/* Error Message */}
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">Page Not Found</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
            </p>
            
            {/* Quick Actions */}
            <div className="mt-8 space-y-4">
              <Link
                href="/dashboard"
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Link>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/search"
                  className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                  Search
                </Link>
                
                <Link
                  href="/companies"
                  className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  Companies
                </Link>
              </div>
            </div>
            
            {/* Help Text */}
            <div className="mt-6 text-xs text-gray-500">
              <p>
                If you think this is an error, please{' '}
                <a 
                  href="mailto:support@investorcodex.com"
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
