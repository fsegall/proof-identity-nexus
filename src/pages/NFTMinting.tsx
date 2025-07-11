
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Image, 
  ArrowLeft, 
  CheckCircle, 
  ExternalLink,
  Sparkles,
  Trophy,
  Star,
  ArrowRight
} from 'lucide-react';

const NFTMinting = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'ERC721' | 'ERC1155'>('ERC721');
  const [isMinting, setIsMinting] = useState(false);
  const [mintingComplete, setMintingComplete] = useState(false);
  const [nftData, setNftData] = useState({
    tokenId: '',
    contractAddress: '',
    transactionHash: '',
    image: '',
    name: '',
    description: ''
  });

  const nftTypes = [
    {
      type: 'ERC721' as const,
      title: 'Unique Identity NFT',
      description: 'One-of-a-kind digital identity token',
      icon: Trophy,
      features: ['Unique ownership', 'Full transferability', 'Maximum utility'],
      recommended: true
    },
    {
      type: 'ERC1155' as const,
      title: 'Multi-Edition NFT',
      description: 'Batch-mintable identity credentials',
      icon: Star,
      features: ['Efficient batch operations', 'Lower gas costs', 'Flexible supply'],
      recommended: false
    }
  ];

  const handleMintNFT = async () => {
    setIsMinting(true);
    
    // Simulate NFT minting process
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Generate mock NFT data
    const mockTokenId = Math.floor(Math.random() * 10000) + 1;
    const mockContractAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const mockTransactionHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const mockImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop';
    
    setNftData({
      tokenId: mockTokenId.toString(),
      contractAddress: mockContractAddress,
      transactionHash: mockTransactionHash,
      image: mockImage,
      name: `ZK Identity #${mockTokenId}`,
      description: 'A unique digital identity NFT with zero-knowledge proof verification'
    });
    
    setMintingComplete(true);
    setIsMinting(false);
  };

  const handleViewOnOpenSea = () => {
    window.open(`https://opensea.io/assets/ethereum/${nftData.contractAddress}/${nftData.tokenId}`, '_blank');
  };

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 backdrop-blur-sm bg-background/80 border-b">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/attestation')}
          className="flex items-center gap-2"
          disabled={isMinting}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Image className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">NFT Minting</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-6">
          
          {mintingComplete ? (
            /* Success View */
            <Card className="shadow-xl border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-green-800 dark:text-green-400">
                  NFT Minted Successfully!
                </CardTitle>
                <CardDescription className="text-green-600 dark:text-green-300">
                  Your digital identity NFT has been created and is now in your wallet
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* NFT Preview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                      <img 
                        src={nftData.image} 
                        alt={nftData.name} 
                        className="w-full aspect-square object-cover rounded-lg border-2 border-primary"
                      />
                    </div>
                    <div className="md:w-1/2 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold">{nftData.name}</h3>
                        <p className="text-muted-foreground">{nftData.description}</p>
                      </div>
                      
                      <div className="grid gap-3">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Token ID</span>
                          <span className="font-mono">#{nftData.tokenId}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Standard</span>
                          <span className="font-medium">{selectedType}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Contract</span>
                          <span className="font-mono text-sm">
                            {nftData.contractAddress.slice(0, 10)}...{nftData.contractAddress.slice(-8)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <StatusBadge status="success">Minted</StatusBadge>
                        <StatusBadge status="success">Verified</StatusBadge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleViewOnOpenSea}
                    className="flex-1 h-12"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    View on OpenSea
                  </Button>
                  <Button 
                    onClick={handleContinueToDashboard}
                    className="btn-gradient flex-1 h-12 text-lg"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Minting Interface */
            <>
              <Card className="shadow-xl">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    {isMinting ? (
                      <LoadingSpinner className="text-white" />
                    ) : (
                      <Image className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-2xl">
                    {isMinting ? 'Minting Your NFT...' : 'Choose NFT Type'}
                  </CardTitle>
                  <CardDescription>
                    {isMinting 
                      ? 'Creating your unique digital identity token on the blockchain'
                      : 'Select the type of NFT you want to mint for your digital identity'
                    }
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {isMinting ? (
                    /* Minting Progress */
                    <div className="space-y-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-4">
                          <LoadingSpinner className="text-blue-600 dark:text-blue-400" />
                          <h4 className="font-medium text-blue-800 dark:text-blue-400">
                            Minting in Progress...
                          </h4>
                        </div>
                        <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                          <p>• Deploying smart contract</p>
                          <p>• Generating metadata</p>
                          <p>• Uploading to IPFS</p>
                          <p>• Confirming transaction</p>
                        </div>
                      </div>
                      
                      <div className="text-center text-muted-foreground">
                        <p>This process may take a few minutes. Please don't close this window.</p>
                      </div>
                    </div>
                  ) : (
                    /* NFT Type Selection */
                    <div className="space-y-6">
                      <RadioGroup 
                        value={selectedType} 
                        onValueChange={(value) => setSelectedType(value as 'ERC721' | 'ERC1155')}
                        className="space-y-4"
                      >
                        {nftTypes.map((nftType) => (
                          <div key={nftType.type} className="relative">
                            <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                              selectedType === nftType.type 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}>
                              {nftType.recommended && (
                                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                                  Recommended
                                </div>
                              )}
                              
                              <div className="flex items-start gap-4">
                                <RadioGroupItem value={nftType.type} id={nftType.type} />
                                <div className="flex-1">
                                  <Label htmlFor={nftType.type} className="cursor-pointer">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                                        nftType.type === 'ERC721' ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-indigo-500'
                                      } flex items-center justify-center`}>
                                        <nftType.icon className="h-5 w-5 text-white" />
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-lg">{nftType.title}</h3>
                                        <p className="text-sm text-muted-foreground">{nftType.description}</p>
                                      </div>
                                    </div>
                                    
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-13">
                                      {nftType.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                          <div className="w-1 h-1 bg-primary rounded-full" />
                                          {feature}
                                        </li>
                                      ))}
                                    </ul>
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                      
                      {/* Metadata Preview */}
                      <div className="bg-muted/50 rounded-lg p-6">
                        <h4 className="font-semibold mb-4">NFT Metadata Preview</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Name</span>
                              <span className="font-medium">ZK Identity #{Math.floor(Math.random() * 10000) + 1}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Description</span>
                              <span className="font-medium">Verified Digital Identity</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Verification</span>
                              <span className="font-medium">ZK Proof Enabled</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Standard</span>
                              <span className="font-medium">{selectedType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Rarity</span>
                              <span className="font-medium">Unique</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Attributes</span>
                              <span className="font-medium">Age Verified</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mint Button */}
                      <Button 
                        onClick={handleMintNFT}
                        className="btn-gradient w-full h-12 text-lg"
                      >
                        <Sparkles className="h-5 w-5 mr-2" />
                        Mint NFT Identity
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTMinting;
