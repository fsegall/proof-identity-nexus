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
        const result = e.target?.result as string;
        setAvatarPreview(result);
        console.log('Avatar preview set:', result ? 'Data loaded successfully' : 'Failed to load data');
      };
      reader.readAsDataURL(file);
    }
  };

  const applyStyleToCanvas = (ctx: CanvasRenderingContext2D, imageData: ImageData, style: string) => {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      switch (style) {
        case 'cyberpunk':
          // Neon cyberpunk effect
          data[i] = Math.min(255, r * 1.3 + 50);     // More red
          data[i + 1] = Math.min(255, g * 1.1 + 30); // Slightly more green
          data[i + 2] = Math.min(255, b * 1.5 + 80); // Much more blue
          break;
          
        case 'fantasy':
          // Warm vintage sepia effect
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
          break;
          
        case 'artistic':
          // Enhanced contrast and saturation
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          const factor = 1.8; // Saturation factor
          data[i] = Math.min(255, gray + factor * (r - gray));
          data[i + 1] = Math.min(255, gray + factor * (g - gray));
          data[i + 2] = Math.min(255, gray + factor * (b - gray));
          break;
          
        case 'minimal':
          // Grayscale with enhanced contrast
          const grayValue = Math.min(255, (0.299 * r + 0.587 * g + 0.114 * b) * 1.3);
          data[i] = grayValue;
          data[i + 1] = grayValue;
          data[i + 2] = grayValue;
          break;
      }
    }
    
    return imageData;
  };

  const generateStyledAvatar = async (style: string) => {
    if (!avatarPreview) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload an image first',
        variant: 'destructive'
      });
      return;
    }
    
    setIsGeneratingStyle(true);
    setSelectedStyle(style);
    setGenerationProgress('Preparing your image...');
    
    try {
      console.log('=== STARTING AVATAR STYLING ===');
      console.log('Style:', style);
      
      setGenerationProgress('Applying filter...');
      
      // Create a temporary canvas for processing
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        throw new Error('Could not create canvas context');
      }
      
      // Load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          tempCtx.drawImage(img, 0, 0);
          
          // Get image data for pixel manipulation
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Apply the selected filter
          const filteredImageData = applyStyleToCanvas(tempCtx, imageData, style);
          
          // Put the filtered data back
          tempCtx.putImageData(filteredImageData, 0, 0);
          
          // Get the styled image as data URL
          const styledImageData = tempCanvas.toDataURL('image/png', 0.9);
          
          setStyledAvatar(styledImageData);
          console.log('✅ Styled avatar set:', styledImageData.substring(0, 50) + '...');
          resolve(styledImageData);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = avatarPreview;
      });
      
      setGenerationProgress('');
      toast({
        title: 'Avatar Styled Successfully!',
        description: `Your photo has been transformed with the ${style} style.`
      });
      
      setCurrentStep(3);
      
    } catch (error) {
      console.error('=== STYLING ERROR ===');
      console.error('Error:', error);
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
    if (avatarPreview) {
      setStyledAvatar(avatarPreview);
      setCurrentStep(3);
      console.log('Skipping styling, using original image');
    }
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
