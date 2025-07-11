
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { 
  Zap, 
  Shield, 
  Cpu, 
  Wallet, 
  ChevronRight, 
  Sparkles,
  Lock,
  Image,
  Database,
  ArrowRight,
  UserCheck
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: Cpu,
      title: "AI Workflows",
      description: "Advanced AI-powered identity verification and proof generation",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Zero-Knowledge Proofs",
      description: "Privacy-preserving verification without revealing sensitive data",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: Image,
      title: "NFT Identity",
      description: "Mint unique digital identity tokens (ERC721 & ERC1155)",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Database,
      title: "Attestation Registry",
      description: "Decentralized registry for verifiable credentials and proofs",
      color: "from-orange-500 to-red-600"
    }
  ];

  const workflow = [
    { step: 1, title: "Connect Wallet", description: "Link your Web3 wallet" },
    { step: 2, title: "Complete Onboarding", description: "Set up your identity profile" },
    { step: 3, title: "Generate Proofs", description: "Create ZK proofs with AI validation" },
    { step: 4, title: "Register Attestation", description: "Store verifiable credentials" },
    { step: 5, title: "Mint NFT", description: "Create your digital identity token" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="flex justify-between items-center p-6 backdrop-blur-sm bg-background/80 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">ZK Identity</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Docs
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            GitHub
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-6 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-slide-up">
              <Sparkles className="h-4 w-4" />
              Next-Generation Identity Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-slide-up">
              Next-Gen Identity & Proof Starter
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
              Combine the power of AI, Zero-Knowledge Proofs, and Web3 to create secure, 
              privacy-preserving digital identities with verifiable credentials.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Button 
                onClick={() => navigate('/onboarding')}
                className="btn-gradient text-lg px-8 py-4 h-auto group"
              >
                <UserCheck className="h-5 w-5 mr-2" />
                Start Age Verification
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => navigate('/connect')}
                variant="outline" 
                className="text-lg px-8 py-4 h-auto border-2"
              >
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build secure, verifiable digital identities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  hoveredCard === index ? 'shadow-lg' : ''
                }`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Workflow
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with our streamlined process in just 5 steps
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6 md:gap-8">
              {workflow.map((item, index) => (
                <div key={index} className="flex items-center gap-6 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  {index < workflow.length - 1 && (
                    <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join the future of digital identity with our comprehensive Web3 + AI + ZK starter kit
          </p>
          <Button 
            onClick={() => navigate('/onboarding')}
            className="bg-white text-primary hover:bg-white/95 text-lg px-8 py-4 h-auto font-semibold"
          >
            Start Building Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ZK Identity</span>
              </div>
              <p className="text-muted-foreground">
                The future of digital identity and proof systems.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 ZK Identity. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
