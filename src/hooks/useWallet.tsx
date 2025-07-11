
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useCallback } from 'react';

export const useWallet = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = useCallback(async () => {
    const metaMaskConnector = connectors.find(connector => 
      connector.name.toLowerCase().includes('metamask')
    );
    
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    } else {
      // Fallback to first available connector
      connect({ connector: connectors[0] });
    }
  }, [connect, connectors]);

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    isConnected,
    account: address || null,
    connectWallet,
    disconnectWallet,
    chainId: chain?.id || null,
    isLoading: isPending,
  };
};
