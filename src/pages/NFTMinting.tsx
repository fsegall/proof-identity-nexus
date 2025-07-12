
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NFTMintingHeader } from '@/components/nft-minting/NFTMintingHeader';
import { NFTMintingProgress } from '@/components/nft-minting/NFTMintingProgress';
import { NFTMintingStepContent } from '@/components/nft-minting/NFTMintingStepContent';
import { useNFTMinting } from '@/hooks/useNFTMinting';

const NFTMinting = () => {
  const {
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
    isPending,
    isConfirming,
    isSuccess,
    fileInputRef,
    handleAvatarUpload,
    generateStyledAvatar,
    handleMintNFT,
    skipStyling,
    navigate
  } = useNFTMinting();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connect');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => navigate('/dashboard'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      <NFTMintingHeader onBack={() => navigate('/attestation')} />
      <NFTMintingProgress currentStep={currentStep} />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <NFTMintingStepContent
          currentStep={currentStep}
          avatarPreview={avatarPreview}
          avatarFile={avatarFile}
          styledAvatar={styledAvatar}
          isGeneratingStyle={isGeneratingStyle}
          selectedStyle={selectedStyle}
          generationProgress={generationProgress}
          isPending={isPending}
          isConfirming={isConfirming}
          isSuccess={isSuccess}
          fileInputRef={fileInputRef}
          handleAvatarUpload={handleAvatarUpload}
          generateStyledAvatar={generateStyledAvatar}
          handleMintNFT={handleMintNFT}
          skipStyling={skipStyling}
          setCurrentStep={setCurrentStep}
          navigate={navigate}
        />
      </div>
    </div>
  );
};

export default NFTMinting;
