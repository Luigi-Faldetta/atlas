'use client';

import React from 'react';
import { ClerkProvider as NextClerkProvider } from '@clerk/nextjs';

export default function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    // @ts-expect-error Server Component type issue with ClerkProvider
    <NextClerkProvider>{children}</NextClerkProvider>
  );
} 