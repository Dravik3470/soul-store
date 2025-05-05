import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import { AuthContext } from "@/App";
import { connectNearWallet } from "@/lib/near";
import { useToast } from "@/hooks/use-toast";

const ConnectWallet = () => {
  const { isAuthenticated, nearWallet, login, logout } = useContext(AuthContext);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      // Connect to NEAR wallet
      console.log("Starting wallet connection...");
      
      // Check if connectNearWallet function is available
      if (typeof connectNearWallet !== 'function') {
        console.error("NEAR wallet connection function not found");
        toast({
          title: "Connection Error",
          description: "Wallet connection method not available",
          variant: "destructive",
        });
        return;
      }
      
      const walletInfo = await connectNearWallet();
      console.log("Wallet connection result:", walletInfo);
      
      if (walletInfo) {
        // Pass wallet info to login function
        console.log("Attempting login with wallet:", walletInfo.walletId);
        await login(walletInfo.walletId, walletInfo.publicAddress);
        toast({
          title: "Connected",
          description: `Successfully connected to ${walletInfo.walletId}`,
        });
      } else {
        console.error("Wallet connection returned null");
        toast({
          title: "Connection failed",
          description: "Unable to connect to NEAR wallet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection error",
        description: "An error occurred while connecting to the wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    await logout();
  };

  if (isAuthenticated && nearWallet) {
    // Show connected wallet
    return (
      <div className="mt-auto">
        <div className="bg-dark-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-light-300">Connected Wallet</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-success"></span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-light-300 font-mono">{nearWallet}</div>
              <div className="text-xs font-mono text-light-300/60">
                {nearWallet.includes('near') 
                  ? `0x${nearWallet.substring(0, 4)}...${nearWallet.substring(nearWallet.length - 4)}`
                  : "0x71...3a2f"}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDisconnect}
              className="text-secondary-400 hover:text-secondary-300 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show connect button
  return (
    <div className="mt-auto">
      <Button 
        onClick={handleConnect}
        className="w-full bg-gradient-to-r from-primary-500 to-secondary-400 hover:opacity-90 text-white"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Connect NEAR Wallet
      </Button>
    </div>
  );
};

export default ConnectWallet;
