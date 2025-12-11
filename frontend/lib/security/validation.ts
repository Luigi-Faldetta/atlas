import { z } from 'zod';

// Security validation schemas
export const PropertyDataSchema = z.object({
  id: z.string().min(1).max(100),
  address: z.string().min(1).max(500),
  price: z.number().positive().max(100000000),
  squareMeters: z.number().positive().max(10000),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  description: z.string().max(2000),
  images: z.array(z.string().url()).optional(),
  // Sanitized data only - no sensitive server data
});

export const UserInputSchema = z.object({
  url: z.string().url().max(2000),
  platform: z.enum(['idealista', 'fotocasa', 'habitaclia']),
  filters: z.object({
    minPrice: z.number().min(0).max(100000000).optional(),
    maxPrice: z.number().min(0).max(100000000).optional(),
    bedrooms: z.number().int().min(0).max(20).optional(),
    location: z.string().max(200).optional(),
  }).optional(),
});

export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  message: z.string().optional(),
  error: z.string().optional(),
});

// Sanitization functions
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: URLs
    .trim()
    .slice(0, 10000); // Limit length
}

export function sanitizeHTML(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  // Basic HTML sanitization - remove dangerous elements and attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=[^>]*/gi, '')
    .replace(/javascript:[^>]*/gi, '')
    .replace(/data:[^>]*/gi, '')
    .trim();
}

export function sanitizeNumber(input: unknown): number {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.max(0, Math.min(num, Number.MAX_SAFE_INTEGER));
}

// Client-safe data transformer
export function createClientSafeData<T>(data: T): Partial<T> {
  if (!data || typeof data !== 'object') return {};
  
  const safe: any = {};
  const allowedKeys = [
    'id', 'address', 'price', 'squareMeters', 'bedrooms', 'bathrooms',
    'description', 'images', 'coordinates', 'propertyType', 'features',
    'analysisScore', 'investmentMetrics', 'marketTrends'
  ];
  
  for (const key of allowedKeys) {
    if (key in data) {
      const value = (data as any)[key];
      
      if (typeof value === 'string') {
        safe[key] = sanitizeString(value);
      } else if (typeof value === 'number') {
        safe[key] = sanitizeNumber(value);
      } else if (Array.isArray(value)) {
        safe[key] = value.map(item => 
          typeof item === 'string' ? sanitizeString(item) : item
        );
      } else if (value && typeof value === 'object') {
        safe[key] = createClientSafeData(value);
      } else {
        safe[key] = value;
      }
    }
  }
  
  return safe;
}

// Validation middleware for client components
export function validateClientProps<T>(
  props: unknown,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(props);
  } catch (error) {
    console.error('Client prop validation failed:', error);
    throw new Error('Invalid component props provided');
  }
}

// Rate limiting for client requests
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
}

export const clientRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute

// Secure fetch wrapper for client-side requests
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Validate URL
  try {
    const urlObj = new URL(url, window.location.origin);
    
    // Get configured API URLs from environment
    const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
    const configuredMcpUrl = process.env.NEXT_PUBLIC_MCP_API_URL;
    
    // Only allow requests to same origin or approved domains
    const allowedDomains = [
      window.location.hostname,
      'localhost',
      '127.0.0.1',
      'api.clerk.dev',
      'clerk.*.dev',
      '*.clerk.accounts.dev',
      // Allow ngrok domains for Docker container communication
      '*.ngrok-free.app',
      '*.ngrok.io',
      '*.loca.lt',
    ];
    
    // Add configured API domains to allowed list
    if (configuredApiUrl) {
      try {
        const apiUrlObj = new URL(configuredApiUrl);
        allowedDomains.push(apiUrlObj.hostname);
      } catch (e) {
        console.warn('Invalid NEXT_PUBLIC_API_URL:', configuredApiUrl);
      }
    }
    
    if (configuredMcpUrl) {
      try {
        const mcpUrlObj = new URL(configuredMcpUrl);
        allowedDomains.push(mcpUrlObj.hostname);
      } catch (e) {
        console.warn('Invalid NEXT_PUBLIC_MCP_API_URL:', configuredMcpUrl);
      }
    }
    
    const isAllowed = allowedDomains.some(domain => {
      if (domain.includes('*')) {
        // Handle wildcard domains
        const pattern = domain.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(urlObj.hostname);
      }
      return urlObj.hostname === domain;
    });
    
    if (!isAllowed) {
      console.warn('Blocked request to unauthorized domain:', urlObj.hostname);
      console.warn('Allowed domains:', allowedDomains);
      throw new Error('Request to unauthorized domain blocked');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('unauthorized domain')) {
      throw error;
    }
    throw new Error('Invalid URL provided');
  }

  // Rate limiting
  const identifier = `${window.location.hostname}-${url}`;
  if (!clientRateLimiter.isAllowed(identifier)) {
    throw new Error('Rate limit exceeded');
  }

  // Add security headers
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    },
    credentials: 'same-origin',
  };

  // Remove any potentially dangerous headers
  if (secureOptions.headers) {
    const headers = secureOptions.headers as Record<string, string>;
    delete headers['x-middleware-subrequest'];
    delete headers['x-now-route-matches'];
    delete headers['__nextDataReq'];
  }

  return fetch(url, secureOptions);
} 