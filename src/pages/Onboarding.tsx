
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Calendar as CalendarLucide
} from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    birthDate: undefined as Date | undefined,
  });

  const { user, loading } = useAuth();
  const { submitProfile, isSubmitting, calculateAge } = useOnboarding(user?.id || null);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Redirect to login if not authenticated
  if (!loading && !user) {
    navigate('/connect');
    return null;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim() !== '';
      case 2:
        return formData.birthDate !== undefined;
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!formData.birthDate) return;
    
    await submitProfile({
      username: formData.username,
      fullName: formData.fullName,
      birthDate: formData.birthDate.toISOString(),
      avatarUrl: null, // No avatar at this stage
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 backdrop-blur-sm bg-background/80 border-b">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Profile Setup</span>
          {user && (
            <span className="text-sm text-muted-foreground">
              ({user.email})
            </span>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="p-6 pb-0">
        <div className="max-w-2xl mx-auto">
          <ProgressBar value={progress} showLabel className="mb-4" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>Almost there!</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {currentStep === 1 && "Personal Information"}
                {currentStep === 2 && "Date of Birth"}
                {currentStep === 3 && "Review & Confirm"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Tell us a bit about yourself"}
                {currentStep === 2 && "Please provide your date of birth for ZK age verification"}
                {currentStep === 3 && "Review your information before proceeding to document verification"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-slide-up">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username (Optional)</Label>
                    <Input
                      id="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="h-12"
                    />
                    <p className="text-sm text-muted-foreground">
                      This will be your unique identifier in the ZK Identity network
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Date of Birth */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-slide-up">
                  <div className="space-y-4">
                    <Label>Date of Birth *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal",
                            !formData.birthDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.birthDate ? (
                            format(formData.birthDate, "PPP")
                          ) : (
                            <span>Select your date of birth</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.birthDate}
                          onSelect={(date) => handleInputChange('birthDate', date || new Date())}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    {formData.birthDate && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <CalendarLucide className="inline h-4 w-4 mr-1" />
                          Age: {calculateAge(formData.birthDate.toISOString())} years old
                        </p>
                        {calculateAge(formData.birthDate.toISOString()) < 18 && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                            ⚠️ You must be at least 18 years old to use this service
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-2">
                      🔒 ZK Privacy Notice
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Your age will be verified using zero-knowledge proofs. This means we can prove 
                      you are over 18 without revealing your exact age or birth date to third parties.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-slide-up">
                  <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{formData.fullName}</h3>
                        {formData.username && (
                          <p className="text-muted-foreground">@{formData.username}</p>
                        )}
                        {formData.birthDate && (
                          <p className="text-sm text-muted-foreground">
                            Age: {calculateAge(formData.birthDate.toISOString())} years old
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Full Name</span>
                      <span className="font-medium">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Username</span>
                      <span className="font-medium">{formData.username || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Date of Birth</span>
                      <span className="font-medium">
                        {formData.birthDate ? format(formData.birthDate, "PPP") : 'Not set'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                      🔄 Next Steps
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      After confirming your profile, you'll need to upload a document photo for age verification. 
                      The document must be issued within the last 4 years.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting || (currentStep === 2 && formData.birthDate && calculateAge(formData.birthDate.toISOString()) < 18)}
                  className="btn-gradient"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <>
                      {currentStep === totalSteps ? 'Continue to Document Verification' : 'Next'}
                      {currentStep < totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
                    </>
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

export default Onboarding;
