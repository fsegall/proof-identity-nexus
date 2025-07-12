
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, AlertCircle, Shield, ArrowLeft, ArrowRight, FileText, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAgeVerification } from '@/hooks/useAgeVerification';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';

const AgeVerification = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentPhoto, setDocumentPhoto] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const { account } = useWallet();
  const { submitVerification, isSubmitting } = useAgeVerification(user?.id || null, account);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate('/connect');
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setDocumentPhoto(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!documentPhoto) return;
    await submitVerification(documentPhoto);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Document Verification</span>
        </div>
      </header>

      {/* Progress */}
      <div className="p-6 pb-0">
        <div className="max-w-2xl mx-auto">
          <ProgressBar value={50} showLabel className="mb-4" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step 2 of 4</span>
            <span>Document Upload</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Document Verification</CardTitle>
              <CardDescription>
                Upload a clear photo of your government-issued ID to verify your age
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Document Preview */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-64 h-40 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center overflow-hidden">
                    {documentPreview ? (
                      <img 
                        src={documentPreview} 
                        alt="Document preview" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Document preview</p>
                      </div>
                    )}
                  </div>
                  {documentPhoto && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-muted/50"
                  onClick={triggerFileInput}
                >
                  <Upload className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <div className="font-medium">Upload Document</div>
                    <div className="text-sm text-muted-foreground">Choose from gallery</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-muted/50"
                  onClick={triggerFileInput}
                >
                  <Camera className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <div className="font-medium">Take Photo</div>
                    <div className="text-sm text-muted-foreground">Use camera</div>
                  </div>
                </Button>
              </div>

              {/* Requirements */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Document Requirements
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    Government-issued ID (Driver's License, Passport, ID Card)
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    Document must be issued within the last 4 years
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    Clear, readable photo with good lighting
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    All corners and text must be visible
                  </li>
                </ul>
              </div>

              {/* Privacy Notice */}
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Privacy & Security
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Your document is analyzed using AI to verify your age without storing personal details. 
                  Only the age verification result is recorded using zero-knowledge proofs for maximum privacy.
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/onboarding')}
                >
                  Back
                </Button>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={!documentPhoto || isSubmitting}
                  className="btn-gradient"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Verifying Document...
                    </>
                  ) : (
                    <>
                      Continue to ZK Verification
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDocumentUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
