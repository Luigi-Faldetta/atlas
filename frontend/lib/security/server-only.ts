import 'server-only';

// Server-only utilities and functions
export interface ServerConfig {
  openaiApiKey: string | undefined;
  clerkSecretKey: string | undefined;
  databaseUrl: string | undefined;
  apiUrl: string;
}

// Secure server configuration - NEVER expose to client
export function getServerConfig(): ServerConfig {
  return {
    openaiApiKey: process.env.OPENAI_API_KEY,
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
    databaseUrl: process.env.DATABASE_URL,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  };
}

// Server-side data filtering - ensures no sensitive data leaks to client
export function filterSensitiveData<T extends Record<string, any>>(
  data: T,
  allowedFields: string[]
): Partial<T> {
  const filtered: Partial<T> = {};
  
  for (const field of allowedFields) {
    if (field in data && data[field] !== undefined) {
      filtered[field as keyof T] = data[field];
    }
  }
  
  return filtered;
}

// Server-side user data sanitizer
export function sanitizeUserData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = [
    'password',
    'passwordHash',
    'secret',
    'token',
    'apiKey',
    'privateKey',
    'ssn',
    'creditCard',
    'bankAccount',
    'internalId',
    'adminNotes'
  ];
  
  const cleaned = { ...data };
  
  for (const field of sensitiveFields) {
    delete cleaned[field];
  }
  
  return cleaned;
}

// Server-side property data transformer
export function createPropertyDTO(rawData: any) {
  // Only include public, non-sensitive property data
  return filterSensitiveData(rawData, [
    'id',
    'address',
    'price',
    'squareMeters',
    'bedrooms',
    'bathrooms',
    'description',
    'images',
    'coordinates',
    'propertyType',
    'features',
    'analysisScore',
    'investmentMetrics',
    'marketTrends',
    'yearBuilt',
    'condition',
    'energyRating'
  ]);
}

// Audit logging for security events
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  userId?: string
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId: userId || 'anonymous',
    details: sanitizeUserData(details),
    userAgent: details.userAgent || 'unknown',
    ip: details.ip || 'unknown'
  };
  
  // In production, this should go to a secure logging service
  console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
} 