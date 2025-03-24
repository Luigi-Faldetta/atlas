'use client';

import React, { ReactNode } from 'react';
import { ApiProvider } from '@/lib/ApiContext';
import { BlockchainProvider } from '@/lib/BlockchainContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApiProvider>
      <BlockchainProvider>
        {children}
      </BlockchainProvider>
    </ApiProvider>
  );
} 