
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWallet } from '@/hooks/useWallet';
import { 
  Wallet, 
  Shield, 
  ArrowLeft, 
  CheckCircle, 
  ExternalLink,
  Chrome,
  Smartphone
} from 'lucide-react';

const WalletConnect = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isConnected, account, connectWallet, isLoading } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const walletOptions = [
    {
      id: 'metamask',
      name: t('wallet.metamask'),
      description: t('wallet.metamaskDesc'),
      icon: Chrome,
      color: 'from-orange-500 to-yellow-500',
      installed: true
    },
    {
      id: 'walletconnect',
      name: t('wallet.walletconnect'),
      description: t('wallet.walletconnectDesc'),
      icon: Smartphone,
      color: 'from-blue-500 to-indigo-500',
      installed: true
    }
  ];

  const handleWalletConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    await connectWallet();
    if (isConnected) {
      setTimeout(() => navigate('/onboarding'), 1500);
    }
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
          {t('nav.backToHome')}
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Identizy</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Status Card */}
          {isConnected ? (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-green-800 dark:text-green-400">
                  {t('wallet.connected')}
                </CardTitle>
                <CardDescription className="text-green-600 dark:text-green-500">
                  {t('wallet.connectedDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{t('wallet.account')}</span>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="font-mono text-sm mt-1 break-all">{account}</p>
                </div>
                <StatusBadge status="success">
                  {t('wallet.network')}
                </StatusBadge>
                <Button 
                  onClick={() => navigate('/onboarding')}
                  className="w-full btn-gradient"
                >
                  {t('wallet.continue')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{t('wallet.title')}</CardTitle>
                <CardDescription>
                  {t('wallet.subtitle')}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {walletOptions.map((wallet) => (
                  <Button
                    key={wallet.id}
                    variant="outline"
                    className="w-full h-auto p-4 flex items-center justify-between hover:bg-muted/50 transition-all duration-200 group"
                    onClick={() => handleWalletConnect(wallet.id)}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${wallet.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <wallet.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{wallet.name}</span>
                          {!wallet.installed && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              {t('wallet.installRequired')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{wallet.description}</p>
                      </div>
                    </div>
                    
                    {isLoading && selectedWallet === wallet.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                        →
                      </div>
                    )}
                  </Button>
                ))}
                
                {/* Security Notice */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-1">
                        {t('wallet.security')}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {t('wallet.securityDesc')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Troubleshooting */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {t('wallet.troubleshooting')}
                  </summary>
                  <div className="mt-2 text-sm text-muted-foreground space-y-2">
                    <p>{t('wallet.troubleStep1')}</p>
                    <p>{t('wallet.troubleStep2')}</p>
                    <p>{t('wallet.troubleStep3')}</p>
                    <p>{t('wallet.troubleStep4')}</p>
                  </div>
                </details>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
