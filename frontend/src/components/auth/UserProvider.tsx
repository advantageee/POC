'use client';

import { useAccount, useMsal } from '@azure/msal-react';
import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { UserRole, User } from '@/types';
import { isAuthenticationEnabled } from '@/lib/auth/config';

interface UserContextType {
  user: User | null;
  loading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  logout: () => void;
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
    if (!isAuthenticationEnabled) {
      // Use localStorage for demo mode
      const localUser = localStorage.getItem('user');
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      
      if (localUser && isAuth) {
        try {
          const parsedUser = JSON.parse(localUser);
          setUser({
            id: parsedUser.id,
            email: parsedUser.email,
            name: parsedUser.name,
            roles: parsedUser.role ? [parsedUser.role as UserRole] : ['Viewer'],
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedUser.name)}&background=0066cc&color=fff`,
            lastLogin: new Date(),
            preferences: {
              theme: 'light',
              notifications: true,
              defaultView: 'companies'
            }
          });
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      setLoading(false);
      return;
    }

    // Azure B2C flow
    if (account) {      // Extract user information from Azure AD B2C claims
      const roles = account.idTokenClaims?.extension_Role && typeof account.idTokenClaims.extension_Role === 'string'
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
    return user?.roles?.includes(role) || false;
  };
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const logout = () => {
    if (isAuthenticationEnabled) {
      // Azure B2C logout
      // Note: You would call instance.logout() here for MSAL
    } else {
      // Clear localStorage for demo mode
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const value: UserContextType = {
    user,
    loading,
    hasRole,
    hasAnyRole,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
