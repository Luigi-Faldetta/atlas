import 'server-only';

// Experimental React taint API for protecting sensitive data
declare function experimental_taintObjectReference(
  message: string,
  object: any
): void;

declare function experimental_taintUniqueValue(
  message: string,
  lifetime: any,
  value: string | bigint
): void;

// Taint sensitive environment variables
export function taintSensitiveData() {
  if (typeof experimental_taintUniqueValue === 'function') {
    // Taint API keys and secrets
    if (process.env.OPENAI_API_KEY) {
      experimental_taintUniqueValue(
        'OpenAI API key should never be sent to the client',
        process,
        process.env.OPENAI_API_KEY
      );
    }
    
    if (process.env.CLERK_SECRET_KEY) {
      experimental_taintUniqueValue(
        'Clerk secret key should never be sent to the client',
        process,
        process.env.CLERK_SECRET_KEY
      );
    }
    
    if (process.env.DATABASE_URL) {
      experimental_taintUniqueValue(
        'Database URL should never be sent to the client',
        process,
        process.env.DATABASE_URL
      );
    }
    
    // Taint any other sensitive environment variables
    const sensitiveEnvVars = [
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'PRIVATE_KEY',
      'SESSION_SECRET',
      'API_SECRET'
    ];
    
    sensitiveEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        experimental_taintUniqueValue(
          `${envVar} should never be sent to the client`,
          process,
          value
        );
      }
    });
  }
}

// Taint objects containing sensitive data
export function taintSensitiveObject(object: any, message: string) {
  if (typeof experimental_taintObjectReference === 'function') {
    experimental_taintObjectReference(message, object);
  }
}

// Taint user data objects to prevent accidental exposure
export function taintUserData(userData: any) {
  if (userData && typeof userData === 'object') {
    taintSensitiveObject(
      userData,
      'User data object contains sensitive information and should not be passed to client components'
    );
    
    // Also taint specific sensitive fields if they exist
    const sensitiveFields = [
      'password',
      'passwordHash',
      'ssn',
      'creditCard',
      'bankAccount',
      'token',
      'refreshToken',
      'apiKey'
    ];
    
    sensitiveFields.forEach(field => {
      if (userData[field] && typeof experimental_taintUniqueValue === 'function') {
        experimental_taintUniqueValue(
          `User ${field} should never be sent to the client`,
          userData,
          String(userData[field])
        );
      }
    });
  }
} 