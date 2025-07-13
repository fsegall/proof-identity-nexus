import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdentityNFTMint } from '@/hooks/useIdentityNFT';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Konva from 'konva';

export const useNFTMinting = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [styledAvatar, setStyledAvatar] = useState<string | null>(null);
  const [isGeneratingStyle, setIsGeneratingStyle] = useState(false);
  const [isGeneratingFace, setIsGeneratingFace] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<string>('');

  const { user, loading: authLoading } = useAuth();
  const { account } = useWallet();

  const { mint, isPending, isConfirming, isSuccess } = useIdentityNFTMint({
    address: account || '0x0',
    imageData: styledAvatar || avatarPreview || undefined
  });

  const generateFace = async (prompt: string) => {
    setIsGeneratingFace(true);
    
    try {
      console.log('=== STARTING FACE GENERATION ===');
      console.log('Prompt:', prompt);
      
      const { data, error } = await supabase.functions.invoke('generate-face', {
        body: { prompt }
      });

      console.log('Face generation response:', { data, error });

      if (error) {
        console.error('=== FACE GENERATION ERROR ===');
        console.error('Error:', error);
        
        let errorMessage = 'Failed to generate face.';
        
        if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
          errorMessage = 'API authentication failed. Please check if your Hugging Face token is configured.';
        } else if (error.message?.includes('timeout') || error.message?.includes('408')) {
          errorMessage = 'Generation took too long. Try again or simplify your prompt.';
        } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        }
        
        throw new Error(errorMessage);
      }

      if (data?.image) {
        console.log('✅ Successfully generated face');
        setAvatarPreview(data.image);
        
        toast({
          title: 'Face Generated Successfully!',
          description: `Your AI-generated face is ready for styling.`
        });
      } else {
        throw new Error('No image was returned from the AI service');
      }
      
    } catch (error) {
      console.error('=== FACE GENERATION ERROR ===');
      console.error('Error:', error);
      toast({
        title: 'Face Generation Failed',
        description: error.message || 'Failed to generate face. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingFace(false);
    }
  };

  const generateStyledAvatar = async (style: string) => {
    if (!avatarPreview) {
      toast({
        title: 'No Image Available',
        description: 'Please generate a face first',
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
        description: `Your face has been transformed with professional ${style} filters.`
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
      console.log('Skipping styling, using original generated image');
    }
  };

  return {
    currentStep,
    setCurrentStep,
    avatarPreview,
    styledAvatar,
    isGeneratingStyle,
    isGeneratingFace,
    selectedStyle,
    generationProgress,
    user,
    authLoading,
    isPending,
    isConfirming,
    isSuccess,
    generateFace,
    generateStyledAvatar,
    handleMintNFT,
    skipStyling,
    navigate
  };
};