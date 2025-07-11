
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { zkApiClient } from '@/services/zkApi';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react';

const AgeVerification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'PROCESSING' | 'VERIFIED' | 'FAILED' | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock user ID - in real app this would come from auth
  const mockUserId = 'user-123';

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      // Buscar o requestId do banco de dados
      const { data, error } = await supabase
        .from('age_verification')
        .select('commitment_hash, status')
        .eq('user_id', mockUserId)
        .single();

      if (error || !data) {
        console.error('Error loading verification status:', error);
        navigate('/onboarding');
        return;
      }

      if (data.commitment_hash) {
        setRequestId(data.commitment_hash);
        
        // Se ainda está processando, começar polling
        if (data.status === 'processing') {
          startPolling(data.commitment_hash);
        } else {
          setStatus(data.status as 'PROCESSING' | 'VERIFIED' | 'FAILED');
        }
      }
    } catch (err) {
      console.error('Error loading verification status:', err);
      toast({
        title: 'Error',
        description: 'Failed to load verification status',
        variant: 'destructive',
      });
    }
  };

  const startPolling = async (zkRequestId: string) => {
    if (isPolling) return;
    
    setIsPolling(true);
    let progressValue = 0;
    
    try {
      const progressInterval = setInterval(() => {
        progressValue += 2;
        setProgress(Math.min(progressValue, 95));
      }, 1000);

      const result = await zkApiClient.pollStatus(zkRequestId, 30, 2000);
      
      clearInterval(progressInterval);
      setProgress(100);
      setStatus(result.status);

      // Atualizar status no banco de dados
      const finalStatus = result.status === 'VERIFIED' ? 'verified' : 'rejected';
      await supabase
        .from('age_verification')
        .update({
          status: finalStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', mockUserId);

      if (result.status === 'VERIFIED') {
        toast({
          title: 'Age Verification Successful!',
          description: '✅ Your age has been verified using zero-knowledge proofs.',
        });
      } else {
        toast({
          title: 'Age Verification Failed',
          description: 'The verification process could not confirm your age. Please try again.',
          variant: 'destructive',
        });
      }
      
    } catch (err: any) {
      console.error('Polling error:', err);
      setStatus('FAILED');
      toast({
        title: 'Verification Timeout',
        description: 'The verification process took too long. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPolling(false);
    }
  };

  const handleContinue = () => {
    if (status === 'VERIFIED') {
      navigate('/attestation');
    } else {
      navigate('/onboarding');
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'PROCESSING':
        return {
          icon: Clock,
          title: 'Verifying Your Age',
          description: 'Zero-knowledge proof generation in progress...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      case 'VERIFIED':
        return {
          icon: CheckCircle,
          title: 'Age Verification Complete!',
          description: 'Your age has been successfully verified using ZK proofs.',
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'FAILED':
        return {
          icon: XCircle,
          title: 'Verification Failed',
          description: 'Unable to verify your age. Please check your information and try again.',
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        };
      default:
        return {
          icon: Shield,
          title: 'Age Verification',
          description: 'Preparing verification process...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 backdrop-blur-sm bg-background/80 border-b">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-2"
          disabled={isPolling}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Age Verification</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${statusInfo.bgColor}`}>
                <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
              </div>
              <CardTitle className="text-2xl">{statusInfo.title}</CardTitle>
              <CardDescription>{statusInfo.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Progress for processing state */}
              {(status === 'PROCESSING' || isPolling) && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verification Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <ProgressBar value={progress} className="h-2" />
                  
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm">Generating zero-knowledge proof...</span>
                  </div>
                </div>
              )}

              {/* Status Details */}
              <div className={`p-6 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Zap className={`h-5 w-5 ${statusInfo.color}`} />
                  <h3 className={`font-semibold ${statusInfo.color}`}>Zero-Knowledge Verification</h3>
                </div>
                
                {status === 'PROCESSING' && (
                  <ul className="text-sm space-y-2 text-blue-700 dark:text-blue-300">
                    <li>• Generating cryptographic proof of age</li>
                    <li>• Ensuring privacy of personal data</li>
                    <li>• Creating blockchain-ready attestation</li>
                  </ul>
                )}
                
                {status === 'VERIFIED' && (
                  <div className="text-sm space-y-2 text-green-700 dark:text-green-300">
                    <p>✅ Age verification completed successfully</p>
                    <p>✅ Zero-knowledge proof generated</p>
                    <p>✅ Ready for blockchain attestation</p>
                  </div>
                )}
                
                {status === 'FAILED' && (
                  <div className="text-sm space-y-2 text-red-700 dark:text-red-300">
                    <p>❌ Verification could not be completed</p>
                    <p>• Please ensure your birth date is correct</p>
                    <p>• Check that you meet the minimum age requirement</p>
                  </div>
                )}
              </div>

              {/* Request ID Display */}
              {requestId && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Request ID</span>
                    <StatusBadge status={status === 'VERIFIED' ? 'success' : status === 'FAILED' ? 'error' : 'pending'}>
                      {status || 'Processing'}
                    </StatusBadge>
                  </div>
                  <p className="font-mono text-sm break-all text-foreground">
                    {requestId}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {status && !isPolling && (
                <div className="flex justify-center">
                  <Button 
                    onClick={handleContinue}
                    className={status === 'VERIFIED' ? 'btn-gradient' : 'btn-outline'}
                    size="lg"
                  >
                    {status === 'VERIFIED' ? (
                      <>
                        Continue to Attestation
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    ) : (
                      'Try Again'
                    )}
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

export default AgeVerification;
