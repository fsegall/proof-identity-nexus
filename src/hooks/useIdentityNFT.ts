
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { foundry } from 'wagmi/chains';
import { CONTRACT_ADDRESSES } from '@/constants/blockchain';
import { supabase } from '@/integrations/supabase/client';

// ABI simplificado para NFT
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
  imageData?: string;
}

export function useIdentityNFTMint({ address, imageData }: UseMintParams) {
  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const mint = async () => {
    try {
      console.log('🚀 Starting mint process...');
      let tokenURI = imageData || '';
      
      // Se temos dados de imagem base64, fazer upload para Supabase Storage
      if (imageData && imageData.startsWith('data:image/')) {
        console.log('📤 Uploading image to Supabase...');
        
        try {
          // Converter base64 para blob
          const response = await fetch(imageData);
          const blob = await response.blob();
          console.log('✅ Image converted to blob, size:', blob.size);
          
          // Fazer upload para Supabase
          const fileName = `avatar-${address}-${Date.now()}.png`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('selfies')
            .upload(`nft-avatars/${fileName}`, blob, {
              contentType: 'image/png',
              cacheControl: '3600'
            });

          if (uploadError) {
            console.error('❌ Upload error:', uploadError);
            console.log('🔄 Using base64 data as fallback');
            tokenURI = imageData; // Usar base64 como fallback
          } else {
            console.log('✅ Upload successful:', uploadData.path);
            // Obter URL pública
            const { data: { publicUrl } } = supabase.storage
              .from('selfies')
              .getPublicUrl(uploadData.path);
            
            tokenURI = publicUrl;
            console.log('✅ Public URL generated:', publicUrl);
          }
        } catch (uploadErr) {
          console.error('❌ Upload process failed:', uploadErr);
          console.log('🔄 Using base64 data as fallback');
          tokenURI = imageData; // Usar base64 como fallback
        }
      }

      // Criar metadata do NFT
      const metadata = {
        name: 'ZK Identity Avatar',
        description: 'AI-generated avatar for ZK Identity verification',
        image: tokenURI,
        attributes: [
          {
            trait_type: 'Type',
            value: 'Identity Avatar'
          },
          {
            trait_type: 'Generated',
            value: 'AI-Styled'
          }
        ]
      };

      // Para fins de demonstração, vamos usar o tokenURI como string JSON
      const tokenURIString = JSON.stringify(metadata);
      console.log('📝 NFT Metadata prepared, size:', tokenURIString.length);

      console.log('⛓️ Calling contract mint function...');
      writeContract({
        address: CONTRACT_ADDRESSES.IDENTITY_NFT,
        abi: IDENTITY_NFT_ABI,
        functionName: 'mint',
        args: [address, tokenURIString],
        account: address,
        chain: foundry,
      });
    } catch (error) {
      console.error('❌ Mint error:', error);
      throw error;
    }
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
