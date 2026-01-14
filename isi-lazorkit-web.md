Smart Wallets. Powered by Passkeys.

Passwordless, phishing-resistant auth for Solana. Users sign in with Face ID/Touch ID—no seed phrases, no extensions. Fast, secure, and ready to ship.
Explore Docs
View on GitHub

npm i @lazorkit/wallet

WebAuthn verified
Passkey bound smart wallet
Built for developers

A clean API surface, batteries included, and battle‑tested primitives.
No Private Keys to Manage
Users authenticate with passkeys — no seed phrases.
Lightning-Fast Onboarding
1‑tap biometric sign‑in with minimal friction.
Plug‑and‑Play SDK
Drop‑in components for React / React Native.
Secure by Design
WebAuthn passkeys with on‑chain smart wallet verification.
Embedded React code

Two quick snippets to integrate LazorKit in React.
Setup the Provider
Wrap your app with LazorkitProvider
React (TSX) · read-only

import { LazorkitProvider } from '@lazorkit/wallet';
export default function App() {
return (
  <LazorkitProvider
    rpcUrl={process.env.LAZORKIT_RPC_URL}
    ipfsUrl={process.env.LAZORKIT_PORTAL_URL}
    paymasterUrl={process.env.LAZORKIT_PAYMASTER_URL}
  >
    <YourApp />
  </LazorkitProvider>
);
}

Use the Wallet Hook
Connect, sign, and send transactions
React (TSX) · read-only

import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

function WalletDemo() {
const {
  // State
  smartWalletPubkey,    // PublicKey | null - Smart wallet address
  isConnected,          // boolean - Connection status (!!account)
  isLoading,            // boolean - Loading state (isConnecting || isSigning)
  isConnecting,         // boolean - Connection in progress
  isSigning,            // boolean - Signing in progress
  error,                // Error | null - Latest error if any
  account,              // WalletAccount | null - Wallet account data

  // Actions
  connect,              // () => Promise<WalletAccount> - Connect wallet (auto-reconnect first)
  disconnect,           // () => Promise<void> - Disconnect wallet (preserves communication)
  signTransaction,      // (instruction: TransactionInstruction) => Promise<string>
  signAndSendTransaction, // (instruction: TransactionInstruction) => Promise<string>

  // New methods for flexible workflows
  createPasskeyOnly,    // () => Promise<ConnectResponse> - Create passkey only
  createSmartWalletOnly, // (passkeyData: ConnectResponse) => Promise<{smartWalletAddress: string, account: WalletAccount}>
  reconnect,            // () => Promise<WalletAccount> - Reconnect using stored credentials
} = useWallet();

// 1. Connect wallet (tries auto-reconnect first)
const handleConnect = async () => {
  try {
    const account = await connect();
    console.log('Connected:', account.smartWallet);
  } catch (error) {
    console.error('Connection failed:', error);
  }
};

// 2. Sign and send transaction
const handleTransfer = async () => {
  if (!smartWalletPubkey) return;

  try {
    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: new PublicKey('7BeWr6tVa1pYgrEddekYTnQENU22bBw9H8HYJUkbrN71'),
      lamports: LAMPORTS_PER_SOL * 0.1,
    });

    const signature = await signAndSendTransaction(instruction);
    console.log('Transfer sent:', signature);
  } catch (error) {
    console.error('Transfer failed:', error);
  }
};

// 3. Disconnect (can reconnect later)
const handleDisconnect = async () => {
  try {
    await disconnect();
    console.log('Disconnected successfully');
  } catch (error) {
    console.error('Disconnect failed:', error);
  }
};

return (
  <div style={{ padding: '20px' }}>
    <h2>LazorKit Wallet Demo</h2>

    {!isConnected ? (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>Wallet: {smartWalletPubkey?.toString().slice(0, 8)}...</p>

        <button onClick={handleTransfer} disabled={isLoading}>
          {isSigning ? 'Sending...' : 'Transfer SOL'}
        </button>

        <button
          onClick={handleDisconnect}
          style={{ backgroundColor: '#ff6b6b' }}
        >
          Disconnect
        </button>
      </div>
    )}

    {error && (
      <p style={{ color: 'red' }}>
        Error: {error.message}
      </p>
    )}
  </div>
);
}

Build passwordless Solana experiences today.

Ship a passkey‑controlled smart wallet in minutes.
Explore Docs
See Example dApp

Install the SDK

npm i @lazorkit/wallet

Or with pnpm / yarn

pnpm add @lazorkit/wallet

yarn add @lazorkit/wallet