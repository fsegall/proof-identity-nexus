import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdentityNFTMint } from '@/hooks/useIdentityNFT';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Canvas as FabricCanvas, FabricImage } from 'fabric';

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

  const applyFilter = (canvas: FabricCanvas, style: string) => {
    const canvasEl = canvas.getElement();
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    switch (style) {
      case 'cyberpunk':
        // Neon glow effect
        canvasEl.style.filter = 'contrast(1.3) brightness(1.2) hue-rotate(200deg) saturate(1.5)';
        break;
      case 'fantasy':
        // Warm vintage effect  
        canvasEl.style.filter = 'sepia(0.3) contrast(1.2) brightness(1.1) saturate(1.4)';
        break;
      case 'artistic':
        // Oil painting effect
        canvasEl.style.filter = 'contrast(1.5) saturate(1.8) blur(0.5px)';
        break;
      case 'minimal':
        // Clean monochrome
        canvasEl.style.filter = 'grayscale(0.7) contrast(1.3) brightness(1.1)';
        break;
      default:
        canvasEl.style.filter = 'none';
    }
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
          
          // Create Fabric canvas for filters
          const fabricCanvas = new FabricCanvas(tempCanvas);
          
          // Apply the selected filter
          applyFilter(fabricCanvas, style);
          
          // Get the styled image as data URL
          setTimeout(() => {
            const styledImageData = fabricCanvas.toDataURL({
              format: 'png',
              quality: 0.9,
              multiplier: 1
            });
            
            setStyledAvatar(styledImageData);
            console.log('✅ Styled avatar set:', styledImageData.substring(0, 50) + '...');
            fabricCanvas.dispose();
            resolve(styledImageData);
          }, 100);
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
