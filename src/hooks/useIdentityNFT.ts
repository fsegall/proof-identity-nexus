
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

// Placeholder ABI para NFT - substitua pelo ABI real do seu contrato
const IDENTITY_NFT_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenURI', type: 'string' }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

// Substitua pelo endereço real do seu contrato NFT
const NFT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;

interface UseMintParams {
  address: `0x${string}`;
  tokenURI: string;
}

export function useIdentityNFTMint({ address, tokenURI }: UseMintParams) {
  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const mint = () => {
    writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: IDENTITY_NFT_ABI,
      functionName: 'mint',
      args: [address, tokenURI],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    mint,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
