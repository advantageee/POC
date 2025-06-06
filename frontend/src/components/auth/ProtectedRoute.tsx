'use client';

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useEffect, ReactNode, useState } from 'react';
import { loginRequest, isAuthenticationEnabled } from '@/lib/auth/config';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Skip authentication if it's disabled
    if (!isAuthenticationEnabled) {
      return;
    }

    // Prevent multiple login attempts
    if (!isAuthenticated && !isLoggingIn) {
      setIsLoggingIn(true);
      
      // Check if we're already in the middle of a redirect flow
      instance.handleRedirectPromise()
        .then((response) => {
          if (response) {
            console.log('Login successful:', response);
          } else if (!isAuthenticated) {
            // Only initiate login if we're not already authenticated
            return instance.loginRedirect(loginRequest);
          }
        })
        .catch((error) => {
          console.error('Authentication error:', error);
          setIsLoggingIn(false);
        });
    }
  }, [isAuthenticated, isLoggingIn, instance]);

  // If authentication is disabled, render children directly
  if (!isAuthenticationEnabled) {
    return <>{children}</>;
  }

  // Show loading state while authenticating
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
