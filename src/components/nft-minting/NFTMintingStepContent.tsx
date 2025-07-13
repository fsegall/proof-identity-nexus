
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarUploadStep } from './AvatarUploadStep';
import { StyleSelectionStep } from './StyleSelectionStep';
import { NFTMintingStep } from './NFTMintingStep';

interface StepContentProps {
  currentStep: number;
  avatarPreview: string | null;
  avatarFile: File | null;
  styledAvatar: string | null;
  isGeneratingStyle: boolean;
  selectedStyle: string;
  generationProgress: string;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  generateStyledAvatar: (style: string) => void;
  handleMintNFT: () => void;
  skipStyling: () => void;
  setCurrentStep: (step: number) => void;
  navigate: (path: string) => void;
}

export const NFTMintingStepContent = ({
  currentStep,
  avatarPreview,
  avatarFile,
  styledAvatar,
  isGeneratingStyle,
  selectedStyle,
  generationProgress,
  isPending,
  isConfirming,
  isSuccess,
  fileInputRef,
  handleAvatarUpload,
  generateStyledAvatar,
  handleMintNFT,
  skipStyling,
  setCurrentStep,
  navigate
}: StepContentProps) => {
  console.log('NFTMintingStepContent - currentStep:', currentStep, 'styledAvatar:', styledAvatar ? 'exists' : 'null');
  
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Upload Your Avatar";
      case 2: return "Style Your Avatar";
      case 3: return "Mint Your NFT";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Choose a photo to represent your digital identity";
      case 2: return "Transform your avatar with AI-powered styling (optional)";
      case 3: return "Create your unique identity NFT on the blockchain";
      default: return "";
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
          <CardDescription>{getStepDescription()}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <AvatarUploadStep
              avatarPreview={avatarPreview}
              avatarFile={avatarFile}
              fileInputRef={fileInputRef}
              handleAvatarUpload={handleAvatarUpload}
              onNext={() => setCurrentStep(2)}
              onBack={() => navigate('/attestation')}
            />
          )}

          {currentStep === 2 && avatarPreview && (
            <StyleSelectionStep
              avatarPreview={avatarPreview}
              isGeneratingStyle={isGeneratingStyle}
              selectedStyle={selectedStyle}
              generationProgress={generationProgress}
              generateStyledAvatar={generateStyledAvatar}
              onBack={() => setCurrentStep(1)}
              skipStyling={skipStyling}
            />
          )}

          {currentStep === 3 && styledAvatar && (
            <NFTMintingStep
              styledAvatar={styledAvatar}
              isPending={isPending}
              isConfirming={isConfirming}
              isSuccess={isSuccess}
              handleMintNFT={handleMintNFT}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 3 && !styledAvatar && (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No styled avatar found. Please go back and style your image.</p>
              <p className="text-xs text-muted-foreground mt-2">Debug: styledAvatar = {styledAvatar ? 'exists' : 'null'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
