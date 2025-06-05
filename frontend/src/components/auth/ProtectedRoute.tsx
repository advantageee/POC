'use client';

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useEffect, ReactNode } from 'react';
import { loginRequest } from '@/lib/auth/config';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login
      instance.loginRedirect(loginRequest).catch(console.error);
    }
  }, [isAuthenticated, instance]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
