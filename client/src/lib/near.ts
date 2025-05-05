// near.ts - Handles NEAR wallet integration

// For a real implementation, we would use near-api-js
// This is a simplified mock for demonstration
export interface NearWalletInfo {
  walletId: string;
  publicAddress: string;
}

// Mock function to initialize NEAR wallet
export function initNearWallet() {
  console.log("Initializing NEAR wallet connection");
  
  // In a real implementation, this would set up event listeners
  // for NEAR wallet connections and handle deep linking
  
  // For this demo, we'll expose a global function that simulates wallet connection
  window.connectNearWallet = connectNearWallet;
}

// Function to simulate wallet connection
// In a real app, this would use NEAR API to connect to wallet
export async function connectNearWallet(): Promise<NearWalletInfo | null> {
  try {
    // Simulate the connection process
    console.log("Connecting to NEAR wallet...");
    
    // In a real implementation, this would redirect to NEAR wallet
    // and handle the callback with account information
    
    // For demo, we'll just create a simulated wallet
    const testWallets = [
      { walletId: 'alex.near', publicAddress: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f' },
      { walletId: 'maria.near', publicAddress: '0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e' },
      { walletId: 'demo.near', publicAddress: '0x2191ef87e392377ec08e7c08eb105ef5448eced5' }
    ];
    
    // Randomly select one of the test wallets
    const randomWallet = testWallets[Math.floor(Math.random() * testWallets.length)];
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return randomWallet;
  } catch (error) {
    console.error("Error connecting to NEAR wallet:", error);
    return null;
  }
}

// Add TypeScript declaration for the global function
declare global {
  interface Window {
    connectNearWallet: () => Promise<NearWalletInfo | null>;
  }
}
