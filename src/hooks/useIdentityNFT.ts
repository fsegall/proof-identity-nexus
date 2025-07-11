
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { foundry } from 'wagmi/chains';
import { CONTRACT_ADDRESSES } from '@/constants/blockchain';

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

interface UseMintParams {
  address: `0x${string}`;
  tokenURI: string;
}

export function useIdentityNFTMint({ address, tokenURI }: UseMintParams) {
  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const mint = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.IDENTITY_NFT,
      abi: IDENTITY_NFT_ABI,
      functionName: 'mint',
      args: [address, tokenURI],
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as `0x${string}`,
      chain: foundry,
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
