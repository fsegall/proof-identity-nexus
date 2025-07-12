
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.login': 'Login',
    'nav.getStarted': 'Get Started',
    'nav.logout': 'Logout',
    'nav.backToHome': 'Back to Home',
    'nav.createAttestation': 'Create Attestation',
    
    // Hero Section
    'hero.badge': 'Powered by Zero-Knowledge Technology',
    'hero.title1': 'Verify Your Identity',
    'hero.title2': 'Without Revealing It',
    'hero.subtitle': 'Experience the future of digital identity with zero-knowledge proofs. Prove you\'re over 18 without sharing personal information, mint unique NFTs, and maintain complete privacy.',
    'hero.startNow': 'Get Started Now',
    'hero.viewDemo': 'View Demo',
    'hero.private': '100% Private',
    'hero.instant': 'Instant Verification',
    'hero.web3Ready': 'Web3 Ready',
    
    // Features
    'features.title': 'Why Choose Identizy?',
    'features.subtitle': 'Revolutionary technology that puts privacy and security at the forefront of digital identity verification.',
    'features.zkProofs.title': 'Zero-Knowledge Proofs',
    'features.zkProofs.desc': 'Prove your identity without revealing personal information using cutting-edge cryptographic techniques.',
    'features.web3.title': 'Web3 Integration',
    'features.web3.desc': 'Seamlessly connect with your favorite wallets and interact with blockchain networks.',
    'features.privacy.title': 'Privacy First',
    'features.privacy.desc': 'Your personal data remains private while still enabling verification and trust.',
    'features.age.title': 'Age Verification',
    'features.age.desc': 'Verify your age for age-restricted services without exposing your birth date.',
    
    // How it works
    'howItWorks.title': 'How It Works',
    'howItWorks.subtitle': 'Get verified in just four simple steps',
    'howItWorks.step1.title': 'Create Account',
    'howItWorks.step1.desc': 'Sign up and create your secure identity profile',
    'howItWorks.step2.title': 'Connect Wallet',
    'howItWorks.step2.desc': 'Link your Web3 wallet for blockchain interactions',
    'howItWorks.step3.title': 'Verify Identity',
    'howItWorks.step3.desc': 'Complete ZK age verification privately and securely',
    'howItWorks.step4.title': 'Mint NFT',
    'howItWorks.step4.desc': 'Get your unique identity NFT as proof of verification',
    
    // CTA
    'cta.title': 'Ready to Get Started?',
    'cta.subtitle': 'Join thousands of users who trust Identizy for secure, private verification.',
    'cta.button': 'Create Your Identity',
    
    // Footer
    'footer.copyright': '© 2024 Identizy. Privacy-first identity verification.',
    
    // Create Attestation
    'createAttestation.title': 'Create Attestation',
    'createAttestation.subtitle': 'Choose the type of verification you need',
    'createAttestation.coming': 'Coming Soon',
    'createAttestation.availableNow': 'Available Now',
    'createAttestation.zkPrivacy': 'Zero-Knowledge Privacy',
    'createAttestation.zkPrivacyDesc': 'All attestations use advanced zero-knowledge cryptography to verify information without exposing your personal data. Your privacy is guaranteed while maintaining full verification integrity.',
    
    // Attestation Types
    'attestation.age.title': 'Age Verification',
    'attestation.age.desc': 'Prove you are over 18 without revealing your birth date',
    'attestation.identity.title': 'Identity Verification',
    'attestation.identity.desc': 'Verify your legal identity with government-issued documents',
    'attestation.address.title': 'Address Verification',
    'attestation.address.desc': 'Prove your residential address with utility bills or bank statements',
    'attestation.income.title': 'Income Verification',
    'attestation.income.desc': 'Verify your income level without disclosing exact amounts',
    'attestation.education.title': 'Education Verification',
    'attestation.education.desc': 'Prove your educational qualifications and degrees',
    'attestation.employment.title': 'Employment Verification',
    'attestation.employment.desc': 'Verify your employment status and professional background',
    'attestation.property.title': 'Property Ownership',
    'attestation.property.desc': 'Prove ownership of real estate or other valuable assets',
    'attestation.financial.title': 'Financial Standing',
    'attestation.financial.desc': 'Verify creditworthiness without exposing detailed financial data',
    
    // Wallet Connect
    'wallet.title': 'Connect Your Wallet',
    'wallet.subtitle': 'Choose your preferred wallet to get started with Identizy',
    'wallet.connected': 'Wallet Connected Successfully!',
    'wallet.connectedDesc': 'Your wallet is now connected and ready to use',
    'wallet.account': 'Account',
    'wallet.network': 'Connected to Ethereum Mainnet',
    'wallet.continue': 'Continue to Onboarding',
    'wallet.metamask': 'MetaMask',
    'wallet.metamaskDesc': 'Connect using MetaMask browser extension',
    'wallet.walletconnect': 'WalletConnect',
    'wallet.walletconnectDesc': 'Connect using mobile wallet via QR code',
    'wallet.installRequired': 'Install Required',
    'wallet.security': 'Your Security Matters',
    'wallet.securityDesc': 'We never store your private keys. Your wallet connection is secure and encrypted.',
    'wallet.troubleshooting': 'Having trouble connecting?',
    'wallet.troubleStep1': '• Make sure your wallet is unlocked',
    'wallet.troubleStep2': '• Check that you\'re on the correct network',
    'wallet.troubleStep3': '• Try refreshing the page and connecting again',
    'wallet.troubleStep4': '• Ensure your wallet extension is up to date'
  },
  pt: {
    // Navigation
    'nav.login': 'Entrar',
    'nav.getStarted': 'Começar',
    'nav.logout': 'Sair',
    'nav.backToHome': 'Voltar ao Início',
    'nav.createAttestation': 'Criar Atestado',
    
    // Hero Section
    'hero.badge': 'Tecnologia Zero-Knowledge',
    'hero.title1': 'Verifique Sua Identidade',
    'hero.title2': 'Sem Revelá-la',
    'hero.subtitle': 'Experimente o futuro da identidade digital com provas zero-knowledge. Prove que você tem mais de 18 anos sem compartilhar informações pessoais, crie NFTs únicos e mantenha total privacidade.',
    'hero.startNow': 'Começar Agora',
    'hero.viewDemo': 'Ver Demo',
    'hero.private': '100% Privado',
    'hero.instant': 'Verificação Instantânea',
    'hero.web3Ready': 'Pronto para Web3',
    
    // Features
    'features.title': 'Por que Escolher Identizy?',
    'features.subtitle': 'Tecnologia revolucionária que coloca privacidade e segurança na vanguarda da verificação de identidade digital.',
    'features.zkProofs.title': 'Provas Zero-Knowledge',
    'features.zkProofs.desc': 'Prove sua identidade sem revelar informações pessoais usando técnicas criptográficas de ponta.',
    'features.web3.title': 'Integração Web3',
    'features.web3.desc': 'Conecte-se perfeitamente com suas carteiras favoritas e interaja com redes blockchain.',
    'features.privacy.title': 'Privacidade em Primeiro Lugar',
    'features.privacy.desc': 'Seus dados pessoais permanecem privados enquanto ainda permitem verificação e confiança.',
    'features.age.title': 'Verificação de Idade',
    'features.age.desc': 'Verifique sua idade para serviços com restrição de idade sem expor sua data de nascimento.',
    
    // How it works
    'howItWorks.title': 'Como Funciona',
    'howItWorks.subtitle': 'Seja verificado em apenas quatro passos simples',
    'howItWorks.step1.title': 'Criar Conta',
    'howItWorks.step1.desc': 'Cadastre-se e crie seu perfil de identidade seguro',
    'howItWorks.step2.title': 'Conectar Carteira',
    'howItWorks.step2.desc': 'Vincule sua carteira Web3 para interações blockchain',
    'howItWorks.step3.title': 'Verificar Identidade',
    'howItWorks.step3.desc': 'Complete a verificação ZK de idade de forma privada e segura',
    'howItWorks.step4.title': 'Criar NFT',
    'howItWorks.step4.desc': 'Obtenha seu NFT de identidade único como prova de verificação',
    
    // CTA
    'cta.title': 'Pronto para Começar?',
    'cta.subtitle': 'Junte-se a milhares de usuários que confiam no Identizy para verificação segura e privada.',
    'cta.button': 'Crie Sua Identidade',
    
    // Footer
    'footer.copyright': '© 2024 Identizy. Verificação de identidade com privacidade em primeiro lugar.',
    
    // Create Attestation
    'createAttestation.title': 'Criar Atestado',
    'createAttestation.subtitle': 'Escolha o tipo de verificação que você precisa',
    'createAttestation.coming': 'Em Breve',
    'createAttestation.availableNow': 'Disponível Agora',
    'createAttestation.zkPrivacy': 'Privacidade Zero-Knowledge',
    'createAttestation.zkPrivacyDesc': 'Todos os atestados usam criptografia zero-knowledge avançada para verificar informações sem expor seus dados pessoais. Sua privacidade é garantida enquanto mantém total integridade na verificação.',
    
    // Attestation Types
    'attestation.age.title': 'Verificação de Idade',
    'attestation.age.desc': 'Prove que você tem mais de 18 anos sem revelar sua data de nascimento',
    'attestation.identity.title': 'Verificação de Identidade',
    'attestation.identity.desc': 'Verifique sua identidade legal com documentos emitidos pelo governo',
    'attestation.address.title': 'Verificação de Endereço',
    'attestation.address.desc': 'Prove seu endereço residencial com contas de utilidades ou extratos bancários',
    'attestation.income.title': 'Verificação de Renda',
    'attestation.income.desc': 'Verifique seu nível de renda sem divulgar valores exatos',
    'attestation.education.title': 'Verificação de Educação',
    'attestation.education.desc': 'Prove suas qualificações educacionais e diplomas',
    'attestation.employment.title': 'Verificação de Emprego',
    'attestation.employment.desc': 'Verifique seu status de emprego e histórico profissional',
    'attestation.property.title': 'Propriedade Imobiliária',
    'attestation.property.desc': 'Prove a propriedade de imóveis ou outros ativos valiosos',
    'attestation.financial.title': 'Situação Financeira',
    'attestation.financial.desc': 'Verifique a credibilidade sem expor dados financeiros detalhados',
    
    // Wallet Connect
    'wallet.title': 'Conectar Sua Carteira',
    'wallet.subtitle': 'Escolha sua carteira preferida para começar com o Identizy',
    'wallet.connected': 'Carteira Conectada com Sucesso!',
    'wallet.connectedDesc': 'Sua carteira está agora conectada e pronta para usar',
    'wallet.account': 'Conta',
    'wallet.network': 'Conectado à Rede Ethereum',
    'wallet.continue': 'Continuar para Onboarding',
    'wallet.metamask': 'MetaMask',
    'wallet.metamaskDesc': 'Conectar usando a extensão MetaMask do navegador',
    'wallet.walletconnect': 'WalletConnect',
    'wallet.walletconnectDesc': 'Conectar usando carteira móvel via código QR',
    'wallet.installRequired': 'Instalação Necessária',
    'wallet.security': 'Sua Segurança Importa',
    'wallet.securityDesc': 'Nunca armazenamos suas chaves privadas. Sua conexão de carteira é segura e criptografada.',
    'wallet.troubleshooting': 'Tendo problemas para conectar?',
    'wallet.troubleStep1': '• Certifique-se de que sua carteira está desbloqueada',
    'wallet.troubleStep2': '• Verifique se você está na rede correta',
    'wallet.troubleStep3': '• Tente atualizar a página e conectar novamente',
    'wallet.troubleStep4': '• Certifique-se de que sua extensão de carteira está atualizada'
  }
};

export const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'en' || saved === 'pt')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
