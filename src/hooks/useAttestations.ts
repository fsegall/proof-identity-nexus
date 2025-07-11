
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/constants/blockchain';

// Placeholder ABI - você pode substituir pelo ABI real do seu contrato
const ATTESTATION_ABI = [
  {
    inputs: [
      { name: 'dataHash', type: 'bytes32' },
      { name: 'attestationType', type: 'string' }
    ],
    name: 'createAttestation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getAttestations',
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'attestationType', type: 'string' }
    ],
    name: 'latestAttestation',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export const useCreateAttestation = () => {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { data: receipt } = useWaitForTransactionReceipt({ hash });

  const createAttestation = (dataHash: `0x${string}`, attestationType: string) => {
    writeContract({
      abi: ATTESTATION_ABI,
      address: CONTRACT_ADDRESS,
      functionName: 'createAttestation',
      args: [dataHash, attestationType],
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as `0x${string}`,
    });
  };

  return {
    createAttestation,
    hash,
    receipt,
    error,
    isPending,
  };
};

export const useGetAttestations = (userAddress: `0x${string}`) => {
  const { data, error, isLoading } = useReadContract({
    abi: ATTESTATION_ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'getAttestations',
    args: [userAddress],
  });

  return {
    attestations: data,
    error,
    isLoading,
  };
};

export const useGetLatestAttestation = (
  userAddress: `0x${string}`,
  attestationType: string
) => {
  const { data, error, isLoading } = useReadContract({
    abi: ATTESTATION_ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'latestAttestation',
    args: [userAddress, attestationType],
  });

  return {
    latestAttestation: data,
    error,
    isLoading,
  };
};
