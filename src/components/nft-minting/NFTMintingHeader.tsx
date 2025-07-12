
import { ArrowLeft, ImageIcon, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';

interface NFTMintingHeaderProps {
  onBack: () => void;
}

export const NFTMintingHeader = ({ onBack }: NFTMintingHeaderProps) => {
  const { disconnectWallet, connectWallet, account } = useWallet();

  return (
    <header className="flex items-center justify-between p-6 backdrop-blur-sm bg-background/80 border-b">
      <Button 
        variant="ghost" 
        onClick={onBack}
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

      {account ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={disconnectWallet}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          Disconnect
        </Button>
      ) : (
        <Button 
          variant="default" 
          size="sm"
          onClick={connectWallet}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      )}
    </header>
  );
};
