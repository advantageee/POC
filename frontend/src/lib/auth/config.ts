import { Configuration } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID || 'your-client-id',
    authority: `https://${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME || 'your-tenant'}.b2clogin.com/${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME || 'your-tenant'}.onmicrosoft.com/${process.env.NEXT_PUBLIC_AZURE_AD_B2C_POLICY_SIGNIN || 'B2C_1_signin'}`,
    knownAuthorities: [`${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME || 'your-tenant'}.b2clogin.com`],
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
            console.error(message);
            break;
          case 1: // Warning
            console.warn(message);
            break;
          case 2: // Info
            console.info(message);
            break;
          case 3: // Verbose
            console.debug(message);
            break;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};
