import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdentityNFTMint } from '@/hooks/useIdentityNFT';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Konva from 'konva';

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
    setGenerationProgress('Creating professional filters...');
    
    try {
      console.log('=== STARTING KONVA STYLING ===');
      console.log('Style:', style);
      
      setGenerationProgress('Loading image...');
      
      // Create Konva stage (hidden)
      const stage = new Konva.Stage({
        container: document.createElement('div'),
        width: 512,
        height: 512
      });
      
      const layer = new Konva.Layer();
      stage.add(layer);
      
      // Load the image
      const imageObj = new Image();
      imageObj.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        imageObj.onload = () => {
          // Create Konva image
          const konvaImage = new Konva.Image({
            image: imageObj,
            width: 512,
            height: 512
          });
          
          setGenerationProgress(`Applying ${style} filter...`);
          
          // Apply professional filters based on style
          switch (style) {
            case 'cyberpunk':
              konvaImage.filters([
                Konva.Filters.HSV,
                Konva.Filters.Contrast,
                Konva.Filters.Brighten
              ]);
              konvaImage.cache();
              konvaImage.hue(200); // Blue/purple tint
              konvaImage.saturation(1.5); // More vibrant
              konvaImage.contrast(0.3); // Higher contrast
              konvaImage.brightness(0.2); // Slightly brighter
              break;
              
            case 'fantasy':
              konvaImage.filters([
                Konva.Filters.HSV,
                Konva.Filters.Brighten
              ]);
              konvaImage.cache();
              // Warm sepia effect through HSV manipulation
              konvaImage.hue(30); // Warm orange/brown tint
              konvaImage.saturation(1.3); // Enhanced colors
              konvaImage.brightness(0.1); // Slightly warmer
              break;
              
            case 'artistic':
              konvaImage.filters([
                Konva.Filters.HSV,
                Konva.Filters.Contrast,
                Konva.Filters.Emboss
              ]);
              konvaImage.cache();
              konvaImage.saturation(2.0); // Very vibrant
              konvaImage.contrast(0.4); // High contrast
              konvaImage.embossStrength(0.3); // Artistic texture
              break;
              
            case 'minimal':
              konvaImage.filters([
                Konva.Filters.Grayscale,
                Konva.Filters.Contrast,
                Konva.Filters.Brighten
              ]);
              konvaImage.cache();
              konvaImage.contrast(0.3); // Enhanced contrast
              konvaImage.brightness(0.1); // Slightly brighter
              break;
          }
          
          layer.add(konvaImage);
          layer.draw();
          
          setGenerationProgress('Finalizing...');
          
          // Export as data URL
          setTimeout(() => {
            const styledImageData = stage.toDataURL({
              mimeType: 'image/png',
              quality: 0.9,
              pixelRatio: 1
            });
            
            setStyledAvatar(styledImageData);
            console.log('✅ Konva styled avatar set:', styledImageData.substring(0, 50) + '...');
            
            // Cleanup
            stage.destroy();
            resolve(styledImageData);
          }, 100);
        };
        
        imageObj.onerror = () => reject(new Error('Failed to load image'));
        imageObj.src = avatarPreview;
      });
      
      setGenerationProgress('');
      toast({
        title: 'Avatar Styled Successfully!',
        description: `Your photo has been transformed with professional ${style} filters.`
      });
      
      setCurrentStep(3);
      
    } catch (error) {
      console.error('=== KONVA STYLING ERROR ===');
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
