
import { Wand2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface NFTMintingStepProps {
  styledAvatar: string;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isMintingDemo?: boolean;
  demoMintSuccess?: boolean;
  handleMintNFT: () => void;
  startDemoMode: () => void;
  onBack: () => void;
}

export const NFTMintingStep = ({
  styledAvatar,
  isPending,
  isConfirming,
  isSuccess,
  isMintingDemo,
  demoMintSuccess,
  handleMintNFT,
  startDemoMode,
  onBack
}: NFTMintingStepProps) => {
  console.log('NFTMintingStep - styledAvatar received:', styledAvatar ? styledAvatar.substring(0, 50) + '...' : 'null');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="w-40 h-40 rounded-lg overflow-hidden border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
           <img 
             src={styledAvatar} 
             alt="Final Avatar" 
             className="w-full h-full object-cover"
             onLoad={() => console.log('✅ Image loaded successfully')}
             onError={(e) => console.error('❌ Image failed to load:', e)}
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

      {isMintingDemo && (
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LoadingSpinner size="lg" className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-blue-800 dark:text-blue-400 mb-2">
            Demo Mode - Simulating Mint
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-2">
            Demonstrating the NFT minting process...
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Note: This is a fallback demonstration for insufficient funds
          </p>
        </div>
      )}

      {isSuccess && (
        <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
            {demoMintSuccess ? 'Demo NFT "Minted" Successfully!' : 'NFT Minted Successfully!'}
          </h3>
          <p className="text-green-700 dark:text-green-300 mb-4">
            {demoMintSuccess 
              ? 'This was a demonstration. Connect wallet with sufficient funds for real minting.'
              : 'Your ZK Identity NFT has been created and added to your wallet.'
            }
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Redirecting to dashboard...
          </p>
        </div>
      )}
      
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="ghost"
            onClick={startDemoMode}
            disabled={isPending || isConfirming || isSuccess}
            className="text-muted-foreground hover:text-foreground"
          >
            Demo Mode
          </Button>
          <Button 
            onClick={handleMintNFT}
            disabled={isPending || isConfirming || isSuccess}
            className="btn-gradient"
          >
            {isPending || isConfirming ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {isMintingDemo ? 'Demo Minting...' : isPending ? 'Minting...' : 'Confirming...'}
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
    </div>
  );
};
