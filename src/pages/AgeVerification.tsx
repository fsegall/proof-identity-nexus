import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

const AgeVerification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'verified' | 'rejected' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    navigate('/connect');
    return null;
  }

  useEffect(() => {
    if (user) {
      loadVerificationStatus();
    }
  }, [user]);

  const loadVerificationStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('age_verification')
        .select('status')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        console.error('Error loading verification status:', error);
        navigate('/onboarding');
        return;
      }

      setStatus(data.status as 'verified' | 'rejected');
      
    } catch (err) {
      console.error('Error loading verification status:', err);
      toast({
        title: 'Error',
        description: 'Failed to load verification status',
        variant: 'destructive',
      });
      navigate('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (status === 'verified') {
      navigate('/attestation');
    } else {
      navigate('/onboarding');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p>Loading verification status...</p>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          title: 'Age Verification Complete!',
          description: 'Your age has been successfully verified using zero-knowledge proofs.',
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'rejected':
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
          description: 'Processing verification...',
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
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Age Verification</span>
          {user && (
            <span className="text-sm text-muted-foreground">
              ({user.email})
            </span>
          )}
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
              {/* Status Details */}
              <div className={`p-6 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Zap className={`h-5 w-5 ${statusInfo.color}`} />
                  <h3 className={`font-semibold ${statusInfo.color}`}>Zero-Knowledge Verification</h3>
                </div>
                
                {status === 'verified' && (
                  <div className="text-sm space-y-2 text-green-700 dark:text-green-300">
                    <p>✅ Age verification completed successfully</p>
                    <p>✅ Zero-knowledge proof generated and verified</p>
                    <p>✅ Ready for blockchain attestation</p>
                  </div>
                )}
                
                {status === 'rejected' && (
                  <div className="text-sm space-y-2 text-red-700 dark:text-red-300">
                    <p>❌ Verification could not be completed</p>
                    <p>• Please ensure your birth date is correct</p>
                    <p>• Check that you meet the minimum age requirement</p>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex justify-center">
                <StatusBadge status={status === 'verified' ? 'success' : 'error'}>
                  {status === 'verified' ? 'Verified' : 'Failed'}
                </StatusBadge>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center">
                <Button 
                  onClick={handleContinue}
                  className={status === 'verified' ? 'btn-gradient' : 'btn-outline'}
                  size="lg"
                >
                  {status === 'verified' ? (
                    <>
                      Continue to Attestation
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  ) : (
                    'Try Again'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
