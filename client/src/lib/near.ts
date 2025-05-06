import { connect, WalletConnection, keyStores } from 'near-api-js';

export interface NearWalletInfo {
  walletId: string;
  publicAddress: string;
}

const nearConfig = {
  networkId: 'testnet',
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://testnet.mynearwallet.com/',
  helperUrl: 'https://helper.testnet.near.org',
  headers: {},
};

console.log(import.meta.env.VITE_NEAR_NETWORK_ID);


let wallet: WalletConnection;
const CONTRACT_ID = 'guest-book.testnet'; 

export async function initNearWallet() {
  console.log("Initializing NEAR wallet connection");
  const near = await connect(nearConfig);
  wallet = new WalletConnection(near, 'soul-scribe');
  window.connectNearWallet = connectNearWallet;
  console.log("NEAR wallet initialized:", wallet.isSignedIn() ? "Signed In" : "Not Signed In");
}

export async function connectNearWallet(): Promise<NearWalletInfo | null> {
  try {
    if (!wallet) {
      console.warn("Wallet not initialized. Call initNearWallet first.");
      return null;
    }

    if (!wallet.isSignedIn()) {
      console.log("Redirecting to NEAR Wallet login...");
      wallet.requestSignIn({
        contractId: CONTRACT_ID,
        successUrl: window.location.origin,
        failureUrl: window.location.origin,
        keyType: 'ed25519'
      });
      return null;
    }

    const accountId = wallet.getAccountId();
    console.log("Account ID:", accountId);
    
    const publicKey = (await wallet.account().connection.signer.getPublicKey(accountId, nearConfig.networkId)).toString();

    console.log("Connected to NEAR wallet:", accountId);
    return {
      walletId: accountId,
      publicAddress: publicKey
    };
  } catch (error) {
    console.error("Error connecting to NEAR wallet:", error);
    return null;
  }
}

declare global {
  interface Window {
    connectNearWallet: () => Promise<NearWalletInfo | null>;
  }
}
