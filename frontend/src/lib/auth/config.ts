import { Configuration } from '@azure/msal-browser';

// Check if authentication is enabled
const isAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTH !== 'false';

// Azure AD B2C configuration
const tenantName = process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME;
const clientId = process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID;
const signinPolicy = process.env.NEXT_PUBLIC_AZURE_AD_B2C_POLICY_SIGNIN || 'B2C_1_signin';

// Default configuration for development (when auth is disabled)
const defaultConfig: Configuration = {
  auth: {
    clientId: 'development-client-id',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

// Production Azure AD B2C configuration
const b2cConfig: Configuration = {
  auth: {
    clientId: clientId || '',
    authority: tenantName 
      ? `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${signinPolicy}`
      : '',
    knownAuthorities: tenantName ? [`${tenantName}.b2clogin.com`] : [],
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case 0: // Error
            console.error('[MSAL]', message);
            break;
          case 1: // Warning
            console.warn('[MSAL]', message);
            break;
          case 2: // Info
            console.info('[MSAL]', message);
            break;
          case 3: // Verbose
            console.debug('[MSAL]', message);
            break;
        }
      },
    },
  },
};

// Use appropriate config based on environment
export const msalConfig: Configuration = 
  isAuthEnabled && tenantName && clientId ? b2cConfig : defaultConfig;

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

// Export auth status for components to check
export const isAuthenticationEnabled = isAuthEnabled && tenantName && clientId;
