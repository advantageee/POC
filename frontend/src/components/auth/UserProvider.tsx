'use client';

import { useAccount, useMsal } from '@azure/msal-react';
import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { UserRole, User } from '@/types';

interface UserContextType {
  user: User | null;
  loading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      // Extract user information from Azure AD B2C claims
      const roles = account.idTokenClaims?.extension_Role 
        ? account.idTokenClaims.extension_Role.split(',').map((r: string) => r.trim() as UserRole)
        : ['Viewer' as UserRole];

      const userData: User = {
        id: account.homeAccountId,
        email: account.username,
        name: account.name || account.username,
        roles,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name || account.username)}&background=0066cc&color=fff`,
        lastLogin: new Date(),
        preferences: {
          theme: 'light',
          notifications: true,
          defaultView: 'companies'
        }
      };

      setUser(userData);
    }
    setLoading(false);
  }, [account]);

  const hasRole = (role: UserRole): boolean => {
    return user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const value: UserContextType = {
    user,
    loading,
    hasRole,
    hasAnyRole
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
