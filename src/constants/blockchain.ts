
// Configurações de blockchain
export const CONTRACT_ADDRESSES = {
  ATTESTATION_REGISTRY: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  IDENTITY_NFT: '0x0000000000000000000000000000000000000000' as `0x${string}`,
} as const;

// Substitua pelos endereços reais dos seus contratos
export const CONTRACT_ADDRESS = CONTRACT_ADDRESSES.ATTESTATION_REGISTRY;
