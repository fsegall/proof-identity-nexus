
import React from 'react';
import { WagmiProvider as WagmiReactProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask, walletConnect } from 'wagmi/connectors';

// Create a new QueryClient instance for Wagmi
const queryClient = new QueryClient();

// Configure Wagmi
const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    metaMask(),
    walletConnect({ 
      projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo' 
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

interface WagmiProviderProps {
  children: React.ReactNode;
}

export const WagmiProvider: React.FC<WagmiProviderProps> = ({ children }) => {
  return (
    <WagmiReactProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiReactProvider>
  );
};
