
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
    'features.title': 'Why Choose ZK Identity?',
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
    'cta.subtitle': 'Join thousands of users who trust ZK Identity for secure, private verification.',
    'cta.button': 'Create Your Identity',
    
    // Footer
    'footer.copyright': '© 2024 ZK Identity. Privacy-first identity verification.',
    
    // Create Attestation
    'createAttestation.title': 'Create Attestation',
    'createAttestation.subtitle': 'Choose the type of verification you need',
    'createAttestation.coming': 'Coming Soon'
  },
  pt: {
    // Navigation
    'nav.login': 'Entrar',
    'nav.getStarted': 'Começar',
    
    // Hero Section
    'hero.badge': 'Powered by Zero-Knowledge Technology',
    'hero.title1': 'Verifique Sua Identidade',
    'hero.title2': 'Sem Revelá-la',
    'hero.subtitle': 'Experimente o futuro da identidade digital com provas zero-knowledge. Prove que você tem mais de 18 anos sem compartilhar informações pessoais, crie NFTs únicos e mantenha total privacidade.',
    'hero.startNow': 'Começar Agora',
    'hero.viewDemo': 'Ver Demo',
    'hero.private': '100% Privado',
    'hero.instant': 'Verificação Instantânea',
    'hero.web3Ready': 'Pronto para Web3',
    
    // Features
    'features.title': 'Por que Escolher ZK Identity?',
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
    'cta.subtitle': 'Junte-se a milhares de usuários que confiam no ZK Identity para verificação segura e privada.',
    'cta.button': 'Crie Sua Identidade',
    
    // Footer
    'footer.copyright': '© 2024 ZK Identity. Verificação de identidade com privacidade em primeiro lugar.',
    
    // Create Attestation
    'createAttestation.title': 'Criar Atestado',
    'createAttestation.subtitle': 'Escolha o tipo de verificação que você precisa',
    'createAttestation.coming': 'Em Breve'
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
