'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
              <div className="text-center">
                {/* Error Icon */}
                <div className="mx-auto flex items-center justify-center h-20 w-20 bg-red-100 rounded-full">
                  <ExclamationTriangleIcon className="h-10 w-10 text-red-600" aria-hidden="true" />
                </div>
                
                {/* Error Message */}
                <h1 className="mt-6 text-3xl font-bold text-gray-900">Something went wrong!</h1>
                <p className="mt-2 text-sm text-gray-600">
                  An unexpected error occurred. This has been logged and we'll look into it.
                </p>
                
                {/* Error Details (Development only) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-md text-left">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Error Details:</h3>
                    <p className="text-xs text-gray-700 font-mono">{error.message}</p>
                    {error.digest && (
                      <p className="text-xs text-gray-500 mt-1">Error ID: {error.digest}</p>
                    )}
                  </div>
                )}
                
                {/* Actions */}
                <div className="mt-8 space-y-4">
                  <button
                    onClick={reset}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Try Again
                  </button>
                  
                  <Link
                    href="/dashboard"
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <HomeIcon className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
