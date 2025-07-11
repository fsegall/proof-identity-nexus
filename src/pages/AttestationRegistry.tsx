
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Database, 
  ArrowLeft, 
  CheckCircle, 
  Hash, 
  Calendar,
  ExternalLink,
  Shield,
  ArrowRight,
  Clock
} from 'lucide-react';

const AttestationRegistry = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [attestationData, setAttestationData] = useState({
    hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    type: 'Age Verification',
    timestamp: new Date(),
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    gasUsed: Math.floor(Math.random() * 50000) + 21000,
    transactionHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
  });

  const handleRegisterAttestation = async () => {
    setIsRegistering(true);
    
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    setRegistrationComplete(true);
    setIsRegistering(false);
  };

  const handleContinueToMinting = () => {
    navigate('/nft-minting');
  };

  const handleViewOnExplorer = () => {
    // Open mock blockchain explorer
    window.open(`https://etherscan.io/tx/${attestationData.transactionHash}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 backdrop-blur-sm bg-background/80 border-b">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/proof-generation')}
          className="flex items-center gap-2"
          disabled={isRegistering}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Database className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Attestation Registry</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Main Card */}
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                {registrationComplete ? (
                  <CheckCircle className="h-8 w-8 text-white" />
                ) : isRegistering ? (
                  <LoadingSpinner className="text-white" />
                ) : (
                  <Database className="h-8 w-8 text-white" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {registrationComplete ? 'Attestation Registered!' : 'Register Attestation'}
              </CardTitle>
              <CardDescription>
                {registrationComplete 
                  ? 'Your verifiable credential has been successfully registered on-chain'
                  : 'Store your zero-knowledge proof in the decentralized attestation registry'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Attestation Preview */}
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Attestation Details</h3>
                  <StatusBadge status={registrationComplete ? "success" : "pending"}>
                    {registrationComplete ? "Registered" : "Ready to Register"}
                  </StatusBadge>
                </div>
                
                <div className="grid gap-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Commitment Hash
                    </span>
                    <span className="font-mono text-sm bg-background px-2 py-1 rounded border">
                      {attestationData.hash.slice(0, 10)}...{attestationData.hash.slice(-8)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Attestation Type
                    </span>
                    <span className="font-medium">{attestationData.type}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Timestamp
                    </span>
                    <span className="font-medium">
                      {attestationData.timestamp.toLocaleString()}
                    </span>
                  </div>
                  
                  {registrationComplete && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Block Number</span>
                        <span className="font-medium">#{attestationData.blockNumber.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Gas Used</span>
                        <span className="font-medium">{attestationData.gasUsed.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Transaction Hash</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleViewOnExplorer}
                          className="font-mono text-sm"
                        >
                          {attestationData.transactionHash.slice(0, 10)}...{attestationData.transactionHash.slice(-8)}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Registry Information */}
              {!registrationComplete && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Database className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                        Decentralized Attestation Registry
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        Your attestation will be stored on the Ethereum blockchain, making it:
                      </p>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Immutable and tamper-proof</li>
                        <li>• Publicly verifiable</li>
                        <li>• Permanently accessible</li>
                        <li>• Interoperable across dApps</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Status */}
              {isRegistering && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-3">
                    <LoadingSpinner className="text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                        Registering Attestation...
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Please wait while your attestation is being registered on the blockchain. 
                        This may take a few minutes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {registrationComplete && (
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-400 mb-1">
                        Registration Successful!
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your attestation has been successfully registered and is now available 
                        for verification across the decentralized web.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                {!registrationComplete && !isRegistering && (
                  <Button 
                    onClick={handleRegisterAttestation}
                    className="btn-gradient flex-1 h-12 text-lg"
                  >
                    Register Attestation
                  </Button>
                )}
                
                {registrationComplete && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={handleViewOnExplorer}
                      className="flex-1 h-12"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      View on Explorer
                    </Button>
                    <Button 
                      onClick={handleContinueToMinting}
                      className="btn-gradient flex-1 h-12 text-lg"
                    >
                      Mint NFT Identity
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttestationRegistry;
