'use client';

import React from 'react';
import { validateClientProps, createClientSafeData, sanitizeString } from '@/lib/security/validation';
import { z } from 'zod';

// Generic secure component wrapper
interface SecureComponentProps<T> {
  data: T;
  schema: z.ZodSchema<T>;
  children: (safeData: Partial<T>) => React.ReactNode;
  fallback?: React.ReactNode;
}

export function SecureComponent<T>({ 
  data, 
  schema, 
  children, 
  fallback = <div>Loading...</div> 
}: SecureComponentProps<T>) {
  try {
    // Validate the incoming data
    const validatedData = validateClientProps(data, schema);
    
    // Create client-safe version
    const safeData = createClientSafeData(validatedData);
    
    return <>{children(safeData)}</>;
  } catch (error) {
    console.error('SecureComponent validation failed:', error);
    return <>{fallback}</>;
  }
}

// Secure text display component
interface SecureTextProps {
  content: unknown;
  maxLength?: number;
  allowHtml?: boolean;
  className?: string;
}

export function SecureText({ 
  content, 
  maxLength = 1000, 
  allowHtml = false, 
  className = '' 
}: SecureTextProps) {
  const safeContent = sanitizeString(content).slice(0, maxLength);
  
  if (allowHtml) {
    // Only use for trusted content - still sanitized
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    );
  }
  
  return <span className={className}>{safeContent}</span>;
}

// Secure image component
interface SecureImageProps {
  src: unknown;
  alt: unknown;
  className?: string;
  fallbackSrc?: string;
}

export function SecureImage({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/images/placeholder.jpg' 
}: SecureImageProps) {
  const safeSrc = typeof src === 'string' && src.startsWith('http') ? src : fallbackSrc;
  const safeAlt = sanitizeString(alt);
  
  return (
    <img 
      src={safeSrc}
      alt={safeAlt}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = fallbackSrc;
      }}
    />
  );
}

// Error boundary for security issues
interface SecurityErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SecurityErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  SecurityErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SecurityErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log security-related errors
    console.error('Security Error Boundary caught an error:', error, errorInfo);
    
    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to logging service
      // logSecurityError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Something went wrong</h3>
          <p className="text-red-600 text-sm mt-1">
            We've encountered a security issue. Please refresh the page or contact support.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Secure form wrapper with validation
interface SecureFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSecureSubmit: (data: FormData) => void;
  validateInputs?: boolean;
}

export function SecureForm({ 
  children, 
  onSecureSubmit, 
  validateInputs = true,
  ...props 
}: SecureFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    if (validateInputs) {
      // Basic validation - prevent XSS in form data
      const entries = Array.from(formData.entries());
      const sanitizedEntries = entries.map(([key, value]) => [
        sanitizeString(key),
        sanitizeString(value)
      ]);
      
      const sanitizedFormData = new FormData();
      sanitizedEntries.forEach(([key, value]) => {
        sanitizedFormData.append(key, value);
      });
      
      onSecureSubmit(sanitizedFormData);
    } else {
      onSecureSubmit(formData);
    }
  };

  return (
    <form {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  );
} 