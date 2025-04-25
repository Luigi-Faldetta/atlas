'use client';

import React from 'react';
import { ClerkProvider as NextClerkProvider } from '@clerk/nextjs';

export default function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextClerkProvider>{children}</NextClerkProvider>;
}
