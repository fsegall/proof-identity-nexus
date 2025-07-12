
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Shield, 
  User, 
  CreditCard, 
  MapPin, 
  GraduationCap, 
  Briefcase,
  Home,
  Calendar,
  FileText,
  ArrowLeft,
  Lock
} from 'lucide-react';

const CreateAttestation = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const attestationTypes = [
    {
      id: 'age-verification',
      title: 'Age Verification',
      description: 'Prove you are over 18 without revealing your birth date',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      available: true,
      path: '/onboarding'
    },
    {
      id: 'identity-verification',
      title: 'Identity Verification',
      description: 'Verify your legal identity with government-issued documents',
      icon: User,
      color: 'from-purple-500 to-pink-500',
      available: false
    },
    {
      id: 'address-verification',
      title: 'Address Verification',
      description: 'Prove your residential address with utility bills or bank statements',
      icon: MapPin,
      color: 'from-green-500 to-emerald-500',
      available: false
    },
    {
      id: 'income-verification',
      title: 'Income Verification',
      description: 'Verify your income level without disclosing exact amounts',
      icon: CreditCard,
      color: 'from-orange-500 to-red-500',
      available: false
    },
    {
      id: 'education-verification',
      title: 'Education Verification',
      description: 'Prove your educational qualifications and degrees',
      icon: GraduationCap,
      color: 'from-indigo-500 to-purple-500',
      available: false
    },
    {
      id: 'employment-verification',
      title: 'Employment Verification',
      description: 'Verify your employment status and professional background',
      icon: Briefcase,
      color: 'from-teal-500 to-cyan-500',
      available: false
    },
    {
      id: 'property-ownership',
      title: 'Property Ownership',
      description: 'Prove ownership of real estate or other valuable assets',
      icon: Home,
      color: 'from-amber-500 to-orange-500',
      available: false
    },
    {
      id: 'financial-standing',
      title: 'Financial Standing',
      description: 'Verify creditworthiness without exposing detailed financial data',
      icon: FileText,
      color: 'from-rose-500 to-pink-500',
      available: false
    }
  ];

  const handleAttestationClick = (attestation: typeof attestationTypes[0]) => {
    if (attestation.available && attestation.path) {
      navigate(attestation.path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="backdrop-blur-sm bg-background/80 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">ZK Identity</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('createAttestation.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('createAttestation.subtitle')}
          </p>
        </div>

        {/* Attestation Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {attestationTypes.map((attestation) => (
            <Card 
              key={attestation.id} 
              className={`relative border-2 transition-all duration-300 cursor-pointer group ${
                attestation.available 
                  ? 'hover:border-primary/40 hover:shadow-lg hover:scale-105' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => handleAttestationClick(attestation)}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${attestation.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <attestation.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {attestation.title}
                  {!attestation.available && (
                    <Lock className="h-4 w-4 text-muted-foreground opacity-50" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4">
                  {attestation.description}
                </CardDescription>
                
                {attestation.available ? (
                  <div className="flex items-center text-primary text-sm font-medium">
                    <Shield className="h-4 w-4 mr-1" />
                    Available Now
                  </div>
                ) : (
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Lock className="h-4 w-4 mr-1" />
                    {t('createAttestation.coming')}
                  </div>
                )}
              </CardContent>
              
              {!attestation.available && (
                <div className="absolute inset-0 bg-background/20 backdrop-blur-[0.5px] rounded-lg" />
              )}
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Zero-Knowledge Privacy</h3>
              <p className="text-muted-foreground">
                All attestations use advanced zero-knowledge cryptography to verify information 
                without exposing your personal data. Your privacy is guaranteed while maintaining 
                full verification integrity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateAttestation;
