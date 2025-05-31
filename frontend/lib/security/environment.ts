// Client-side environment variable access with security checks

// List of environment variables that are safe to expose to the client
const SAFE_PUBLIC_ENV_VARS = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_MCP_API_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_CLERK_DOMAIN',
  'NEXT_PUBLIC_CLERK_PROXY_URL',
  'NEXT_PUBLIC_CLERK_IS_SATELLITE',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_JS_VERSION',
  'NEXT_PUBLIC_CLERK_JS_URL',
] as const;

// List of sensitive environment variables that should NEVER be exposed
const SENSITIVE_ENV_VARS = [
  'CLERK_SECRET_KEY',
  'OPENAI_API_KEY',
  'DATABASE_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'PRIVATE_KEY',
  'SESSION_SECRET',
  'API_SECRET',
  'NEXT_SERVER_ACTIONS_ENCRYPTION_KEY',
  'CLERK_ENCRYPTION_KEY',
] as const;

type SafeEnvVar = typeof SAFE_PUBLIC_ENV_VARS[number];

// Secure environment variable access for client-side code
export function getPublicEnvVar(key: SafeEnvVar): string | undefined {
  // Double-check that the variable name is in our safe list
  if (!SAFE_PUBLIC_ENV_VARS.includes(key)) {
    console.error(`Attempt to access non-public environment variable: ${key}`);
    return undefined;
  }

  // Only access variables that start with NEXT_PUBLIC_
  if (!key.startsWith('NEXT_PUBLIC_')) {
    console.error(`Environment variable ${key} is not properly prefixed with NEXT_PUBLIC_`);
    return undefined;
  }

  return process.env[key];
}

// Runtime security check to ensure no sensitive data is in client bundle
export function validateEnvironmentSecurity() {
  if (typeof window !== 'undefined') {
    // We're on the client side - check for accidental exposure
    const exposedSensitiveVars: string[] = [];
    
    SENSITIVE_ENV_VARS.forEach(varName => {
      // Check if sensitive variables are accidentally exposed
      if ((process.env as any)[varName]) {
        exposedSensitiveVars.push(varName);
      }
    });

    if (exposedSensitiveVars.length > 0) {
      console.error('SECURITY WARNING: Sensitive environment variables detected on client:', exposedSensitiveVars);
      
      // In production, this should trigger an alert to security team
      if (process.env.NODE_ENV === 'production') {
        // Send security alert
        console.error('CRITICAL SECURITY BREACH: Sensitive data exposed to client');
      }
    }
  }
}

// Secure configuration object for client-side use
export const clientConfig = {
  apiUrl: getPublicEnvVar('NEXT_PUBLIC_API_URL') || 'http://localhost:5001',
  mcpApiUrl: getPublicEnvVar('NEXT_PUBLIC_MCP_API_URL') || 'http://localhost:3001/api/v1',
  clerkPublishableKey: getPublicEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
  clerkDomain: getPublicEnvVar('NEXT_PUBLIC_CLERK_DOMAIN'),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Initialize security validation
if (typeof window !== 'undefined') {
  validateEnvironmentSecurity();
} 