
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';

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

// Substitua pelo endereço real do seu contrato
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;

export const useCreateAttestation = () => {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { data: receipt } = useWaitForTransactionReceipt({ hash });

  const createAttestation = (dataHash: `0x${string}`, attestationType: string) => {
    writeContract({
      abi: ATTESTATION_ABI,
      address: CONTRACT_ADDRESS,
      functionName: 'createAttestation',
      args: [dataHash, attestationType],
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
