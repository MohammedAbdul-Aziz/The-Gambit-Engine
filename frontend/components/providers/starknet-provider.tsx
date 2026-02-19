'use client';

import {
  StarknetConfig,
  starkscan,
  jsonRpcProvider,
  useInjectedConnectors,
  braavos,
  ready,
} from '@starknet-react/core';
import { mainnet, sepolia } from '@starknet-react/chains';
import { ReactNode } from 'react';

interface StarknetProviderProps {
  children: ReactNode;
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  const chains = [mainnet, sepolia];
  const { connectors } = useInjectedConnectors({
    // Show these connectors if the user has no connector installed.
    recommended: [ready(), braavos()],
    // Hide recommended connectors if the user has any connector installed.
    includeRecommended: 'always',
  });

  return (
    <StarknetConfig
      chains={chains}
      provider={jsonRpcProvider({
        rpc: () => ({
          nodeUrl: 'https://starknet-sepolia.public.blastapi.io',
        }),
      })}
      connectors={connectors}
      explorer={starkscan}
    >
      {children}
    </StarknetConfig>
  );
}
