'use client';

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useEffect, ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { loginRequest, isAuthenticationEnabled } from '@/lib/auth/config';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    // If authentication is disabled, allow access to all pages
    if (!isAuthenticationEnabled) {
      setIsLocallyAuthenticated(true);
      return;
    }

    // Azure B2C authentication flow
    if (!isAuthenticated && !isLoggingIn) {
      setIsLoggingIn(true);
      
      instance.handleRedirectPromise()
        .then((response) => {
          if (response) {
            console.log('Login successful:', response);
          } else if (!isAuthenticated) {
            return instance.loginRedirect(loginRequest);
          }
        })
        .catch((error) => {
          console.error('Authentication error:', error);
          setIsLoggingIn(false);
        });
    }
  }, [isAuthenticated, isLoggingIn, instance, isAuthenticationEnabled, router, pathname]);
  // If authentication is disabled, use localStorage check
  if (!isAuthenticationEnabled) {
    return <>{children}</>;
  }

  // Azure B2C authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoggingIn ? 'Signing you in...' : 'Authenticating...'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
