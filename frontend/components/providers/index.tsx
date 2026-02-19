'use client';

import { ReactNode } from 'react';
import { StarknetProvider } from './starknet-provider';
import { QueryProvider } from './query-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <StarknetProvider>
        {children}
      </StarknetProvider>
    </QueryProvider>
  );
}
