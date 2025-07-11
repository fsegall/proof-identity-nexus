
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./components/providers/Web3Provider";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import Landing from "./pages/Landing";
import WalletConnect from "./pages/WalletConnect";
import Onboarding from "./pages/Onboarding";
import ProofGeneration from "./pages/ProofGeneration";
import AttestationRegistry from "./pages/AttestationRegistry";
import NFTMinting from "./pages/NFTMinting";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Web3Provider>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/connect" element={<WalletConnect />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/proof-generation" element={<ProofGeneration />} />
                <Route path="/attestation" element={<AttestationRegistry />} />
                <Route path="/nft-minting" element={<NFTMinting />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </Web3Provider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
