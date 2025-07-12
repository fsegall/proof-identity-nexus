
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdentityNFTMint } from '@/hooks/useIdentityNFT';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useNFTMinting = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [styledAvatar, setStyledAvatar] = useState<string | null>(null);
  const [isGeneratingStyle, setIsGeneratingStyle] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<string>('');

  const { user, loading: authLoading } = useAuth();
  const { account } = useWallet();

  const { mint, isPending, isConfirming, isSuccess } = useIdentityNFTMint({
    address: account || '0x0',
    imageData: styledAvatar || avatarPreview || undefined
  });

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a valid image file',
          variant: 'destructive'
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'File size must be less than 10MB',
          variant: 'destructive'
        });
        return;
      }

      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateStyledAvatar = async (style: string) => {
    if (!avatarPreview) return;
    
    setIsGeneratingStyle(true);
    setSelectedStyle(style);
    setGenerationProgress('Starting generation...');
    
    try {
      const prompt = `portrait of a person, professional headshot, high quality, same person, maintaining facial features`;
      
      setGenerationProgress('Sending image for processing...');
      
      const { data, error } = await supabase.functions.invoke('generate-styled-avatar', {
        body: {
          prompt,
          style: style.toLowerCase(),
          imageData: avatarPreview
        }
      });

      if (error) {
        console.error('Generation error:', error);
        
        if (error.message?.includes('timeout')) {
          throw new Error('Generation took too long. Please try again with a different style.');
        } else if (error.message?.includes('credits')) {
          throw new Error('Hugging Face credits exhausted. Please check your subscription.');
        } else if (error.message?.includes('unauthorized')) {
          throw new Error('Invalid Hugging Face API token. Please verify your configuration.');
        } else {
          throw new Error('Failed to generate styled avatar.');
        }
      }

      if (data?.image) {
        setStyledAvatar(data.image);
        setGenerationProgress('');
        toast({
          title: 'Avatar Styled Successfully!',
          description: `Your avatar has been transformed with the ${style} style.`
        });
        setCurrentStep(3);
      } else {
        throw new Error('No image was returned');
      }
      
    } catch (error) {
      console.error('Styling error:', error);
      setGenerationProgress('');
      toast({
        title: 'Styling Failed',
        description: error.message || 'Failed to style your avatar. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingStyle(false);
    }
  };

  const handleMintNFT = async () => {
    if (!account) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to mint NFT',
        variant: 'destructive'
      });
      return;
    }

    try {
      await mint();
    } catch (error) {
      console.error('Minting error:', error);
      toast({
        title: 'Minting Failed',
        description: 'Failed to mint NFT. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const skipStyling = () => {
    setStyledAvatar(avatarPreview);
    setCurrentStep(3);
  };

  return {
    currentStep,
    setCurrentStep,
    avatarFile,
    avatarPreview,
    styledAvatar,
    isGeneratingStyle,
    selectedStyle,
    generationProgress,
    user,
    authLoading,
    account,
    mint,
    isPending,
    isConfirming,
    isSuccess,
    fileInputRef,
    handleAvatarUpload,
    generateStyledAvatar,
    handleMintNFT,
    skipStyling,
    navigate
  };
};
