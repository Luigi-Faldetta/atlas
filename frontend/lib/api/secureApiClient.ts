'use client';

import { secureFetch, UserInputSchema, APIResponseSchema } from '../security/validation';
import { z } from 'zod';

// Secure API client for frontend requests
export class SecureApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  // Secure property analysis request
  async analyzeProperty(data: z.infer<typeof UserInputSchema>) {
    // Validate input data
    const validatedData = UserInputSchema.parse(data);
    
    try {
      const response = await secureFetch(`${this.baseUrl}/property-analysis`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Validate response structure
      return APIResponseSchema.parse(result);
    } catch (error) {
      console.error('Property analysis request failed:', error);
      throw new Error('Failed to analyze property. Please try again.');
    }
  }

  // Secure MCP API requests
  async mcpRequest(endpoint: string, data?: any) {
    try {
      const url = `${process.env.NEXT_PUBLIC_MCP_API_URL}${endpoint}`;
      
      const response = await secureFetch(url, {
        method: data ? 'POST' : 'GET',
        headers: this.defaultHeaders,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`MCP API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MCP API request failed:', error);
      throw new Error('Failed to connect to MCP service.');
    }
  }

  // Health check with security validation
  async healthCheck() {
    try {
      const response = await secureFetch('/health', {
        method: 'GET',
        headers: this.defaultHeaders,
      });

      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const secureApiClient = new SecureApiClient();

// Hook for using secure API client in components
export function useSecureApi() {
  return secureApiClient;
} 