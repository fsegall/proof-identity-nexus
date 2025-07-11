
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Shield, 
  ArrowLeft, 
  CheckCircle, 
  Cpu, 
  Eye, 
  Lock,
  Hash,
  Timer,
  ArrowRight
} from 'lucide-react';

const ProofGeneration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proofComplete, setProofComplete] = useState(false);
  const [commitmentHash, setCommitmentHash] = useState('');

  const steps = [
    {
      id: 'face-validation',
      title: 'AI Face Validation',
      description: 'Analyzing facial features and liveness detection',
      icon: Eye,
      duration: 3000
    },
    {
      id: 'age-verification',
      title: 'Age Verification',
      description: 'Zero-knowledge proof of age without revealing exact age',
      icon: Shield,
      duration: 4000
    },
    {
      id: 'proof-generation',
      title: 'Proof Generation',
      description: 'Creating cryptographic proofs using ZK-SNARKs',
      icon: Cpu,
      duration: 5000
    },
    {
      id: 'commitment',
      title: 'Commitment Hash',
      description: 'Generating commitment for attestation registry',
      icon: Hash,
      duration: 2000
    }
  ];

  const startProofGeneration = async () => {
    setIsGenerating(true);
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }
    
    // Generate mock commitment hash
    const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setCommitmentHash(mockHash);
    
    setProofComplete(true);
    setIsGenerating(false);
  };

  const handleContinue = () => {
    navigate('/attestation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 backdrop-blur-sm bg-background/80 border-b">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-2"
          disabled={isGenerating}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Proof Generation</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Status Card */}
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                {proofComplete ? (
                  <CheckCircle className="h-8 w-8 text-white" />
                ) : (
                  <Shield className="h-8 w-8 text-white" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {proofComplete ? 'Proof Generation Complete!' : 'Generating ZK Proofs'}
              </CardTitle>
              <CardDescription>
                {proofComplete 
                  ? 'Your zero-knowledge proofs have been successfully generated'
                  : 'AI-powered identity verification and zero-knowledge proof creation in progress'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!isGenerating && !proofComplete && (
                <div className="text-center space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                      Privacy-First Verification
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Our AI will analyze your profile to generate zero-knowledge proofs that verify 
                      your identity without revealing sensitive personal information.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={startProofGeneration}
                    className="btn-gradient w-full h-12 text-lg"
                  >
                    Start Proof Generation
                  </Button>
                </div>
              )}

              {/* Progress Steps */}
              {(isGenerating || proofComplete) && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {steps.map((step, index) => {
                      const isActive = index === currentStep && isGenerating;
                      const isCompleted = index < currentStep || proofComplete;
                      const isPending = index > currentStep && !proofComplete;
                      
                      return (
                        <div 
                          key={step.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${
                            isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                            isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                            'bg-muted/50 border-border'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-blue-500 animate-pulse' :
                            isCompleted ? 'bg-green-500' :
                            'bg-muted'
                          }`}>
                            {isActive ? (
                              <LoadingSpinner size="sm" className="text-white" />
                            ) : isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : (
                              <step.icon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className={`font-semibold ${
                              isActive ? 'text-blue-800 dark:text-blue-400' :
                              isCompleted ? 'text-green-800 dark:text-green-400' :
                              'text-muted-foreground'
                            }`}>
                              {step.title}
                            </h3>
                            <p className={`text-sm ${
                              isActive ? 'text-blue-600 dark:text-blue-300' :
                              isCompleted ? 'text-green-600 dark:text-green-300' :
                              'text-muted-foreground'
                            }`}>
                              {step.description}
                            </p>
                          </div>
                          
                          <div>
                            {isActive && <StatusBadge status="pending">Processing</StatusBadge>}
                            {isCompleted && <StatusBadge status="success">Complete</StatusBadge>}
                            {isPending && <StatusBadge status="warning">Pending</StatusBadge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium">
                        {proofComplete ? '100%' : `${Math.round(((currentStep + 1) / steps.length) * 100)}%`}
                      </span>
                    </div>
                    <ProgressBar 
                      value={proofComplete ? 100 : ((currentStep + 1) / steps.length) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              )}

              {/* Commitment Hash Display */}
              {proofComplete && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Commitment Hash</span>
                      <Hash className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="font-mono text-sm break-all text-foreground">
                      {commitmentHash}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="font-medium mb-1">Proof Type</div>
                      <div className="text-muted-foreground">Age Verification ZK-SNARK</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="font-medium mb-1">Verification Status</div>
                      <div className="text-green-600 dark:text-green-400">✓ Verified</div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleContinue}
                    className="btn-gradient w-full h-12 text-lg"
                  >
                    Register Attestation
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProofGeneration;
