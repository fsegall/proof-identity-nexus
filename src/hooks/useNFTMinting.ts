import { useState, useEffect } from 'react';
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
  const [isMintingDemo, setIsMintingDemo] = useState(false);
  const [demoMintSuccess, setDemoMintSuccess] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const { account } = useWallet();

  const { mint, isPending, isConfirming, isSuccess, hash } = useIdentityNFTMint({
    address: account || '0x0',
    imageData: styledAvatar || avatarPreview || undefined
  });

  // Update user avatar when NFT mint is successful
  useEffect(() => {
    const updateUserAvatar = async () => {
      if (isSuccess && hash && styledAvatar && user?.id) {
        try {
          console.log('✅ NFT minted successfully! Transaction hash:', hash);
          
          // Save the styled avatar to user's profile
          const { error } = await supabase
            .from('users')
            .update({ avatar_url: styledAvatar })
            .eq('id', user.id);
          
          if (error) {
            console.error('Error updating avatar:', error);
          } else {
            console.log('✅ Avatar saved to user profile');
          }
          
          toast({
            title: 'NFT Minted Successfully!',
            description: `Your ZK Identity NFT has been minted. Transaction: ${hash}`,
          });
          
          // Navigate to dashboard after successful mint
          setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
          console.error('Error saving avatar:', error);
        }
      }
    };

    updateUserAvatar();
  }, [isSuccess, hash, styledAvatar, user?.id, toast, navigate]);

  const generateFace = async (prompt: string, photoFile?: File) => {
    setIsGeneratingFace(true);
    setGenerationProgress('Starting generation...');
    
    try {
      console.log('=== STARTING AVATAR GENERATION ===');
      console.log('Prompt:', prompt);
      console.log('Photo file:', !!photoFile);
      
      // Create FormData for the request
      const formData = new FormData();
      formData.append('prompt', prompt);
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      
      const { data, error } = await supabase.functions.invoke('generate-face', {
        body: formData
      });
      
      setGenerationProgress('Processing image...');

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
        console.log('✅ Successfully generated avatar');
        setAvatarPreview(data.image);
        setGenerationProgress('Complete!');
        
        toast({
          title: 'Avatar Generated Successfully!',
          description: photoFile 
            ? 'Your personalized AI avatar has been created successfully.' 
            : 'Your AI avatar has been created successfully.',
        });
      } else {
        throw new Error('No image was returned from the AI service');
      }
      
    } catch (error) {
      console.error('=== AVATAR GENERATION ERROR ===');
      console.error('Error details:', error);
      
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      
      setAvatarPreview(null);
    } finally {
      console.log('=== AVATAR GENERATION COMPLETE ===');
      setIsGeneratingFace(false);
      setGenerationProgress('');
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
    console.log('🎯 handleMintNFT called');
    
    if (!account) {
      console.log('❌ No account connected');
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to mint NFT',
        variant: 'destructive'
      });
      return;
    }

    console.log('✅ Account connected:', account);

    try {
      console.log('🚀 Calling mint function...');
      await mint();
      console.log('✅ Mint function completed');
    } catch (error: any) {
      console.error('❌ Minting error details:', {
        message: error?.message,
        code: error?.code,
        reason: error?.reason,
        error: error
      });
      
      // Check if it's an insufficient funds error (prioritize this check)
      if (error?.message?.includes('insufficient') || 
          error?.code === 'INSUFFICIENT_FUNDS' ||
          error?.message?.includes('gas') ||
          error?.message?.includes('balance') ||
          error?.reason?.includes('insufficient') ||
          error?.message?.includes('exceeds balance') ||
          error?.shortMessage?.includes('insufficient')) {
        
        console.log('💰 Insufficient funds detected - starting demo mode');
        // Show fallback demo mint for MVP
        toast({
          title: 'Demo Mode - Insufficient Funds',
          description: 'Simulating NFT mint process for demonstration purposes.',
          variant: 'default'
        });
        
        // Simulate the minting process for demo
        setIsMintingDemo(true);
        
        // Save the styled avatar to user's profile
        if (styledAvatar && user?.id) {
          try {
            const { error } = await supabase
              .from('users')
              .update({ avatar_url: styledAvatar })
              .eq('id', user.id);
            
            if (error) {
              console.error('Error updating avatar:', error);
            } else {
              console.log('✅ Avatar saved to user profile');
            }
          } catch (error) {
            console.error('Error saving avatar:', error);
          }
        }
        
        setTimeout(() => {
          setIsMintingDemo(false);
          setDemoMintSuccess(true);
          
          toast({
            title: 'Demo NFT "Minted" Successfully!',
            description: 'This is a demonstration. Connect wallet with sufficient funds for real minting.',
          });
          
          setTimeout(() => navigate('/dashboard'), 2000);
        }, 3000);
        
        return;
      }
      
      // Check if user rejected the transaction (but not due to insufficient funds)
      if (error?.code === 4001 || 
          error?.message?.includes('User rejected') ||
          error?.message?.includes('rejected') ||
          error?.message?.includes('denied by the user') ||
          error?.code === 'ACTION_REJECTED') {
        
        console.log('🚫 User rejected transaction');
        
        // If likely rejected due to insufficient funds, show demo mode
        if (error?.message?.toLowerCase().includes('insufficient') ||
            error?.message?.toLowerCase().includes('balance') ||
            error?.message?.toLowerCase().includes('gas')) {
          
          console.log('💰 User rejection likely due to insufficient funds - starting demo mode');
          toast({
            title: 'Demo Mode - Insufficient Funds',
            description: 'Simulating NFT mint process for demonstration purposes.',
            variant: 'default'
          });
          
          setIsMintingDemo(true);
          
          // Save the styled avatar to user's profile
          if (styledAvatar && user?.id) {
            try {
              const { error } = await supabase
                .from('users')
                .update({ avatar_url: styledAvatar })
                .eq('id', user.id);
              
              if (error) {
                console.error('Error updating avatar:', error);
              } else {
                console.log('✅ Avatar saved to user profile');
              }
            } catch (error) {
              console.error('Error saving avatar:', error);
            }
          }
          
          setTimeout(() => {
            setIsMintingDemo(false);
            setDemoMintSuccess(true);
            
            toast({
              title: 'Demo NFT "Minted" Successfully!',
              description: 'This is a demonstration. Connect wallet with sufficient funds for real minting.',
            });
            
            setTimeout(() => navigate('/dashboard'), 2000);
          }, 3000);
          
          return;
        }
        
        // Regular user cancellation
        toast({
          title: 'Transaction Cancelled',
          description: 'You cancelled the transaction. Try again when ready.',
          variant: 'default'
        });
        return;
      }
      
      console.log('❌ Unknown minting error');
      toast({
        title: 'Minting Failed',
        description: 'Failed to mint NFT. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const startDemoMode = async () => {
    console.log('🎭 Starting demo mode manually');
    toast({
      title: 'Demo Mode Started',
      description: 'Simulating NFT mint process for demonstration purposes.',
      variant: 'default'
    });
    
    setIsMintingDemo(true);
    
    // Save the styled avatar to user's profile
    if (styledAvatar && user?.id) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ avatar_url: styledAvatar })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error updating avatar:', error);
        } else {
          console.log('✅ Avatar saved to user profile');
        }
      } catch (error) {
        console.error('Error saving avatar:', error);
      }
    }
    
    setTimeout(() => {
      setIsMintingDemo(false);
      setDemoMintSuccess(true);
      
      toast({
        title: 'Demo NFT "Minted" Successfully!',
        description: 'This is a demonstration. Connect wallet with sufficient funds for real minting.',
      });
      
      setTimeout(() => navigate('/dashboard'), 2000);
    }, 3000);
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
    isPending: isPending || isMintingDemo,
    isConfirming,
    isSuccess: isSuccess || demoMintSuccess,
    isMintingDemo,
    demoMintSuccess,
    generateFace,
    generateStyledAvatar,
    handleMintNFT,
    startDemoMode,
    skipStyling,
    navigate
  };
};