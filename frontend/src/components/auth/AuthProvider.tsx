'use client';

import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '@/lib/auth/config';
import { ReactNode, useEffect, useState } from 'react';

let msalInstance: PublicClientApplication | null = null;

// Initialize MSAL instance only once
const initializeMsal = async () => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
  }
  return msalInstance;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [instance, setInstance] = useState<PublicClientApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const msalInst = await initializeMsal();
        setInstance(msalInst);
      } catch (error) {
        console.error('MSAL initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading || !instance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MsalProvider instance={instance}>
      {children}
    </MsalProvider>
  );
}
