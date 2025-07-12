
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Upload, 
  Wand2, 
  ArrowLeft, 
  ArrowRight, 
  Download,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Crown,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useIdentityNFTMint } from '@/hooks/useIdentityNFT';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NFTMinting = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1); // 1: Avatar, 2: Style, 3: Mint
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [styledAvatar, setStyledAvatar] = useState<string | null>(null);
  const [isGeneratingStyle, setIsGeneratingStyle] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');

  const { user, loading: authLoading } = useAuth();
  const { account } = useWallet();

  const { mint, isPending, isConfirming, isSuccess } = useIdentityNFTMint({
    address: account || '0x0',
    imageData: styledAvatar || avatarPreview || undefined
  });

  const styles = [
    { id: 'cyberpunk', name: 'Cyberpunk', icon: Zap, description: 'Futuristic neon aesthetic' },
    { id: 'fantasy', name: 'Fantasy', icon: Crown, description: 'Magical medieval style' },
    { id: 'artistic', name: 'Artistic', icon: Palette, description: 'Abstract art style' },
    { id: 'minimal', name: 'Minimal', icon: Sparkles, description: 'Clean and simple' }
  ];

  if (!authLoading && !user) {
    navigate('/connect');
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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
    
    try {
      // Criar um prompt baseado na imagem do usuário
      const prompt = `portrait of a person, professional headshot, high quality`;
      
      const { data, error } = await supabase.functions.invoke('generate-styled-avatar', {
        body: {
          prompt,
          style: style.toLowerCase()
        }
      });

      if (error) {
        console.error('Generation error:', error);
        throw new Error('Failed to generate styled avatar');
      }

      if (data?.image) {
        setStyledAvatar(data.image);
        toast({
          title: 'Avatar Styled Successfully!',
          description: `Your avatar has been transformed with ${style} style.`
        });
        setCurrentStep(3);
      } else {
        throw new Error('No image data received');
      }
      
    } catch (error) {
      console.error('Styling error:', error);
      toast({
        title: 'Styling Failed',
        description: 'Failed to style your avatar. Please try again.',
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

  if (isSuccess) {
    setTimeout(() => navigate('/dashboard'), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 backdrop-blur-sm bg-background/80 border-b">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/attestation')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">NFT Creation</span>
        </div>
      </header>

      {/* Progress */}
      <div className="p-6 pb-0">
        <div className="max-w-2xl mx-auto">
          <ProgressBar value={75 + (currentStep * 8)} showLabel className="mb-4" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step 4 of 4</span>
            <span>NFT Creation</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {currentStep === 1 && "Upload Your Avatar"}
                {currentStep === 2 && "Style Your Avatar"}
                {currentStep === 3 && "Mint Your NFT"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Choose a photo to represent your digital identity"}
                {currentStep === 2 && "Transform your avatar with AI-powered styling (optional)"}
                {currentStep === 3 && "Create your unique identity NFT on the blockchain"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Step 1: Avatar Upload */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img 
                            src={avatarPreview} 
                            alt="Avatar preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-16 w-16 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-6 flex items-center justify-center gap-3"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">Upload Avatar</div>
                        <div className="text-sm text-muted-foreground">JPG, PNG up to 10MB</div>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="flex justify-between pt-6 border-t">
                    <Button variant="outline" onClick={() => navigate('/attestation')}>
                      Back
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      disabled={!avatarFile}
                      className="btn-gradient"
                    >
                      Continue to Styling
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: AI Styling */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
                      <img 
                        src={avatarPreview!} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {styles.map((style) => {
                      const IconComponent = style.icon;
                      return (
                        <Button
                          key={style.id}
                          variant="outline"
                          className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-primary/5"
                          onClick={() => generateStyledAvatar(style.name.toLowerCase())}
                          disabled={isGeneratingStyle}
                        >
                          <IconComponent className="h-8 w-8 text-primary" />
                          <div className="text-center">
                            <div className="font-medium">{style.name}</div>
                            <div className="text-sm text-muted-foreground">{style.description}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>

                  {isGeneratingStyle && (
                    <div className="text-center p-6 bg-muted/20 rounded-lg">
                      <LoadingSpinner size="lg" className="mx-auto mb-4" />
                      <p className="font-medium">Generating {selectedStyle} Style...</p>
                      <p className="text-sm text-muted-foreground">This may take a few moments</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-6 border-t">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={skipStyling}>
                        Skip Styling
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Mint NFT */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 rounded-lg overflow-hidden border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
                      <img 
                        src={styledAvatar!} 
                        alt="Final Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center mt-4">
                      <h3 className="font-semibold text-lg">Your ZK Identity NFT</h3>
                      <p className="text-sm text-muted-foreground">Ready to be minted on the blockchain</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border">
                    <h4 className="font-medium mb-3">NFT Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Collection:</span>
                        <span>ZK Identity</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Standard:</span>
                        <span>ERC-721</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network:</span>
                        <span>Ethereum</span>
                      </div>
                    </div>
                  </div>

                  {isSuccess && (
                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
                        NFT Minted Successfully!
                      </h3>
                      <p className="text-green-700 dark:text-green-300 mb-4">
                        Your ZK Identity NFT has been created and added to your wallet.
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Redirecting to dashboard...
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-6 border-t">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleMintNFT}
                      disabled={isPending || isConfirming || isSuccess}
                      className="btn-gradient"
                    >
                      {isPending || isConfirming ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          {isPending ? 'Minting...' : 'Confirming...'}
                        </>
                      ) : isSuccess ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Minted Successfully!
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Mint NFT
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NFTMinting;
