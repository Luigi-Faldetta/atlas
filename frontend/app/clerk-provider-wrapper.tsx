// filepath: /home/luigif/Documents/Atlas/atlas/frontend/app/clerk-provider-wrapper.tsx
// NO 'use client' directive here!

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export default function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // ClerkProvider is used in a Server Component context here
  // Explicitly provide publishableKey from environment variable
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}
