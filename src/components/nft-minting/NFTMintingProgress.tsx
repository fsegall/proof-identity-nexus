
import { ProgressBar } from '@/components/ui/ProgressBar';

interface NFTMintingProgressProps {
  currentStep: number;
}

export const NFTMintingProgress = ({ currentStep }: NFTMintingProgressProps) => {
  return (
    <div className="p-6 pb-0">
      <div className="max-w-2xl mx-auto">
        <ProgressBar value={75 + (currentStep * 8)} showLabel className="mb-4" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step 4 of 4</span>
          <span>NFT Creation</span>
        </div>
      </div>
    </div>
  );
};
