
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Shield, 
  Image, 
  Database,
  ExternalLink,
  Copy,
  Settings,
  LogOut,
  Trophy,
  Calendar,
  Hash,
  Wallet,
  Activity,
  TrendingUp,
  Star,
  Home
} from 'lucide-react';

interface UserProfile {
  full_name: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { account, disconnectWallet } = useWallet();
  const { user } = useAuth();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name, username, avatar_url, created_at')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        setUserProfile(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  // Mock data for demo - in a real app, this would come from the database
  const userData = {
    name: userProfile?.full_name || "Alex Johnson",
    username: userProfile?.username || "alexj",
    avatar: userProfile?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    joinedDate: new Date(userProfile?.created_at || '2024-01-15'),
    totalNFTs: 1,
    totalAttestations: 1,
    verificationLevel: "Verified"
  };

  const nftCollection = [
    {
      id: 1,
      name: "ZK Identity NFT",
      type: "ERC721",
      image: userData.avatar,
      mintDate: new Date(),
      verified: true,
      description: "Your unique ZK Identity NFT with verified age proof"
    }
  ];

  const attestationHistory = [
    {
      id: 1,
      type: "Age Verification",
      hash: "0x742d35Cc6634C0532925a3b8D8c89Adf1F84",
      date: new Date(),
      status: "verified",
      blockNumber: 18500000
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleLogout = () => {
    disconnectWallet();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="backdrop-blur-sm bg-background/80 border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ZK Identity</h1>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-5 w-5" />
                Home
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Profile */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <img 
                      src={userData.avatar} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full mx-auto border-4 border-primary/20 object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold">{userData.name}</h2>
                    {userData.username && (
                      <p className="text-muted-foreground">@{userData.username}</p>
                    )}
                  </div>
                  
                  <StatusBadge status="success">
                    {userData.verificationLevel}
                  </StatusBadge>
                  
                  {account && (
                    <div className="bg-muted/50 rounded-lg p-3 text-left">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Wallet</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account)}
                          className="h-6 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-mono text-xs mt-1 break-all">
                        {account}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">NFTs Owned</span>
                  </div>
                  <span className="font-bold">{userData.totalNFTs}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Attestations</span>
                  </div>
                  <span className="font-bold">{userData.totalAttestations}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Member Since</span>
                  </div>
                  <span className="font-bold text-xs">
                    {userData.joinedDate.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="nfts">NFTs</TabsTrigger>
                <TabsTrigger value="attestations">Attestations</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Welcome Card */}
                <Card className="shadow-lg gradient-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Welcome back, {userData.name}!</h3>
                        <p className="text-muted-foreground">
                          Your ZK Identity is fully verified and ready to use across the decentralized web.
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">✅</div>
                        <div className="text-sm text-muted-foreground">Fully Verified</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Identity NFT Showcase */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Your ZK Identity NFT
                    </CardTitle>
                    <CardDescription>
                      Your unique digital identity with verified age proof
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/20">
                        <img 
                          src={userData.avatar} 
                          alt="ZK Identity NFT"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">ZK Identity #{Math.floor(Math.random() * 10000)}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Verified identity NFT for {userData.name}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3 text-green-500" />
                            Age Verified
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="h-3 w-3 text-blue-500" />
                            ZK Proof
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            ERC-721
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* NFTs Tab */}
              <TabsContent value="nfts" className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Your NFT Collection
                    </CardTitle>
                    <CardDescription>
                      Digital identity tokens and credentials you own
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {nftCollection.map((nft) => (
                        <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={nft.image} 
                              alt={nft.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm">{nft.name}</h3>
                                {nft.verified && (
                                  <StatusBadge status="success">
                                    <Shield className="h-3 w-3" />
                                  </StatusBadge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{nft.description}</p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{nft.type}</span>
                                <span>{nft.mintDate.toLocaleDateString()}</span>
                              </div>
                              <Button variant="outline" size="sm" className="w-full">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attestations Tab */}
              <TabsContent value="attestations" className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Attestation Registry
                    </CardTitle>
                    <CardDescription>
                      Your verified credentials and proofs on the blockchain
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {attestationHistory.map((attestation) => (
                        <div key={attestation.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <Shield className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{attestation.type}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Block #{attestation.blockNumber.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <StatusBadge status="success">Verified</StatusBadge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {attestation.date.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                              {attestation.hash}
                            </span>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View on Explorer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
