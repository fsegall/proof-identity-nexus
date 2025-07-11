
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  User, 
  Upload, 
  ArrowLeft, 
  ArrowRight, 
  Camera,
  Sparkles,
  Check
} from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    avatar: null as File | null,
    avatarPreview: null as string | null
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, avatarPreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIAvatar = async () => {
    setIsLoading(true);
    // Simulate AI avatar generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use placeholder avatar
    const placeholderAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
    setFormData(prev => ({ ...prev, avatarPreview: placeholderAvatar }));
    setIsLoading(false);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    // Simulate profile creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    navigate('/proof-generation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 backdrop-blur-sm bg-background/80 border-b">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/connect')}
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
                {currentStep === 2 && "Profile Avatar"}
                {currentStep === 3 && "Review & Confirm"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Tell us a bit about yourself"}
                {currentStep === 2 && "Choose or generate your profile picture"}
                {currentStep === 3 && "Review your information before proceeding"}
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

              {/* Step 2: Avatar Upload */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-slide-up">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center overflow-hidden">
                        {formData.avatarPreview ? (
                          <img 
                            src={formData.avatarPreview} 
                            alt="Avatar preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-16 w-16 text-white" />
                        )}
                      </div>
                      {formData.avatarPreview && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6" />
                      <span>Upload Photo</span>
                      <span className="text-sm text-muted-foreground">JPG, PNG up to 10MB</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={generateAIAvatar}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <Sparkles className="h-6 w-6" />
                          <span>AI Generate</span>
                          <span className="text-sm text-muted-foreground">Create with AI</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-slide-up">
                  <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center overflow-hidden">
                        {formData.avatarPreview ? (
                          <img 
                            src={formData.avatarPreview} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{formData.fullName}</h3>
                        {formData.username && (
                          <p className="text-muted-foreground">@{formData.username}</p>
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
                      <span className="text-muted-foreground">Avatar</span>
                      <span className="font-medium">{formData.avatarPreview ? 'Uploaded' : 'Not set'}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                      Next Steps
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      After confirming your profile, we'll generate AI-powered proofs and create 
                      zero-knowledge attestations for your identity verification.
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
                  disabled={!formData.fullName || isLoading}
                  className="btn-gradient"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <>
                      {currentStep === totalSteps ? 'Generate Proof' : 'Next'}
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
