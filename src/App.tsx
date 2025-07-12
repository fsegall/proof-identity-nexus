
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "./components/providers/WagmiProvider";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import WalletConnect from "./pages/WalletConnect";
import Onboarding from "./pages/Onboarding";
import AgeVerification from "./pages/AgeVerification";
import ProofGeneration from "./pages/ProofGeneration";
import AttestationRegistry from "./pages/AttestationRegistry";
import NFTMinting from "./pages/NFTMinting";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <ThemeProvider>
      <WagmiProvider>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/connect" element={<WalletConnect />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/age-verification" element={<AgeVerification />} />
              <Route path="/proof-generation" element={<ProofGeneration />} />
              <Route path="/attestation" element={<AttestationRegistry />} />
              <Route path="/nft-minting" element={<NFTMinting />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </WagmiProvider>
    </ThemeProvider>
  </TooltipProvider>
);

export default App;
