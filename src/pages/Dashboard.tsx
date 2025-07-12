
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useWallet } from '@/hooks/useWallet';
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
  Star
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { account, disconnectWallet } = useWallet();
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Mock user data
  const userData = {
    name: "Alex Johnson",
    username: "alexj",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    joinedDate: new Date('2024-01-15'),
    totalNFTs: 3,
    totalAttestations: 5,
    verificationLevel: "Gold"
  };

  const nftCollection = [
    {
      id: 1,
      name: "ZK Identity #7834",
      type: "ERC721",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop",
      mintDate: new Date('2024-01-15'),
      verified: true
    },
    {
      id: 2,
      name: "Age Verification Badge",
      type: "ERC1155",
      image: "https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=300&h=300&fit=crop",
      mintDate: new Date('2024-01-20'),
      verified: true
    },
    {
      id: 3,
      name: "Professional Credential",
      type: "ERC721",
      image: "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=300&h=300&fit=crop",
      mintDate: new Date('2024-01-25'),
      verified: true
    }
  ];

  const attestationHistory = [
    {
      id: 1,
      type: "Age Verification",
      hash: "0x742d35Cc6634C0532925a3b8D8c89Adf1F84",
      date: new Date('2024-01-15'),
      status: "verified",
      blockNumber: 18500000
    },
    {
      id: 2,
      type: "Identity Proof",
      hash: "0x8f4c7e2b1a9d3f5e6c8b7a2d4e3f1c9b8a7d",
      date: new Date('2024-01-20'),
      status: "verified",
      blockNumber: 18501234
    },
    {
      id: 3,
      type: "Credential Verification",
      hash: "0x3e9f1c8b7a2d4e5f6c9b8a7d3e2f1c8b7a9d",
      date: new Date('2024-01-25'),
      status: "verified",
      blockNumber: 18502456
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
                      className="w-20 h-20 rounded-full mx-auto border-4 border-primary/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold">{userData.name}</h2>
                    <p className="text-muted-foreground">@{userData.username}</p>
                  </div>
                  
                  <StatusBadge status="success">
                    {userData.verificationLevel} Verified
                  </StatusBadge>
                  
                  <div className="bg-muted/50 rounded-lg p-3 text-left">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Wallet</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(account || '')}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-mono text-xs mt-1 break-all">
                      {account}
                    </p>
                  </div>
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="nfts">NFTs</TabsTrigger>
                <TabsTrigger value="attestations">Attestations</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
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
                        <div className="text-3xl font-bold text-primary">{userData.verificationLevel}</div>
                        <div className="text-sm text-muted-foreground">Verification Level</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Image className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">NFT Minted Successfully</p>
                          <p className="text-sm text-muted-foreground">Professional Credential #3421</p>
                        </div>
                        <span className="text-sm text-muted-foreground">2 days ago</span>
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Database className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Attestation Registered</p>
                          <p className="text-sm text-muted-foreground">Identity Proof verification</p>
                        </div>
                        <span className="text-sm text-muted-foreground">5 days ago</span>
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Profile Verified</p>
                          <p className="text-sm text-muted-foreground">ZK proof validation completed</p>
                        </div>
                        <span className="text-sm text-muted-foreground">1 week ago</span>
                      </div>
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
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{nft.type}</span>
                                <span>{nft.mintDate.toLocaleDateString()}</span>
                              </div>
                              <Button variant="outline" size="sm" className="w-full">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View on OpenSea
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

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Activity Timeline
                    </CardTitle>
                    <CardDescription>
                      Complete history of your ZK Identity interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                        
                        <div className="space-y-6">
                          <div className="flex gap-4">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center relative z-10">
                              <Image className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">NFT Minted</h3>
                                <span className="text-sm text-muted-foreground">Jan 25, 2024</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Professional Credential #3421</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center relative z-10">
                              <Database className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Attestation Registered</h3>
                                <span className="text-sm text-muted-foreground">Jan 20, 2024</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Identity Proof verification</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center relative z-10">
                              <Shield className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Profile Created</h3>
                                <span className="text-sm text-muted-foreground">Jan 15, 2024</span>
                              </div>
                              <p className="text-sm text-muted-foreground">ZK Identity profile initialized</p>
                            </div>
                          </div>
                        </div>
                      </div>
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
