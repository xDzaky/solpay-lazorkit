# 📖 Tutorial 1: Creating a Passkey-Based Wallet

> **Time to complete:** ~10 minutes
> 
> **Prerequisites:** Basic understanding of React and Solana

---

## Overview

In this tutorial, you'll learn how to implement passkey-based wallet authentication using Lazorkit SDK. By the end, you'll understand:

1. How WebAuthn passkeys replace seed phrases
2. How Lazorkit creates smart wallets from passkeys
3. How to implement a connect button in React

---

## 🧠 Understanding the Flow

### Traditional Wallet Flow
```
User → Install Extension → Create Seed Phrase → Write Down 24 Words → Done
```

### Lazorkit Passkey Flow
```
User → Click "Connect" → FaceID/TouchID → Done ✨
```

### What Happens Under the Hood

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│  Your App   │────▶│  Lazorkit   │────▶│  Device     │
│             │     │  (React)    │     │  Portal     │     │  (Passkey)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                                       │
                           │                                       │
                           ▼                                       │
                    ┌─────────────┐                                │
                    │  Smart      │◀───────────────────────────────┘
                    │  Wallet PDA │     Returns credential + public key
                    │  (on-chain) │
                    └─────────────┘
```

**Key Points:**
- **Passkey** = WebAuthn credential stored in your device's Secure Enclave
- **Smart Wallet** = Program Derived Address (PDA) controlled by your passkey
- **No private key exposure** = Keys never leave your device

---

## 🛠️ Step 1: Install Dependencies

```bash
npm install @lazorkit/wallet @solana/web3.js
```

Or with your preferred package manager:

```bash
# pnpm
pnpm add @lazorkit/wallet @solana/web3.js

# yarn
yarn add @lazorkit/wallet @solana/web3.js
```

---

## 🛠️ Step 2: Configure Polyfills (Vite/Next.js)

Solana libraries need Buffer polyfills. Here's how to set them up:

### For Vite

Install the polyfill plugin:

```bash
npm install vite-plugin-node-polyfills
```

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(), // Add this
  ],
});
```

### For Next.js

Add to your root layout or provider file:

```typescript
// src/providers/index.tsx
'use client';

// Polyfill Buffer for client-side
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || require('buffer').Buffer;
}
```

---

## 🛠️ Step 3: Create the Wallet Provider

Wrap your app with `LazorkitProvider`:

```typescript
// src/providers/WalletProvider.tsx
'use client';

import { ReactNode } from 'react';
import { LazorkitProvider } from '@lazorkit/wallet';

// Configuration - using Devnet defaults
const CONFIG = {
  RPC_URL: 'https://api.devnet.solana.com',
  PORTAL_URL: 'https://portal.lazor.sh',
  PAYMASTER_URL: 'https://kora.devnet.lazorkit.com',
};

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <LazorkitProvider
      rpcUrl={CONFIG.RPC_URL}
      portalUrl={CONFIG.PORTAL_URL}
      paymasterConfig={{
        paymasterUrl: CONFIG.PAYMASTER_URL,
      }}
    >
      {children}
    </LazorkitProvider>
  );
}
```

---

## 🛠️ Step 4: Build the Connect Button

Here's a complete, well-commented connect button component:

```typescript
// src/components/ConnectButton.tsx
'use client';

import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';

/**
 * ConnectButton
 * 
 * A button that handles the entire passkey authentication flow:
 * 1. User clicks "Connect"
 * 2. Lazorkit portal opens
 * 3. User authenticates with FaceID/TouchID
 * 4. Smart wallet is created/retrieved
 * 5. User is connected!
 */
export function ConnectButton() {
  // ─────────────────────────────────────────────────────────────────────────
  // Hook: useWallet from Lazorkit SDK
  // ─────────────────────────────────────────────────────────────────────────
  const {
    // State
    isConnected,        // boolean - Is wallet connected?
    isConnecting,       // boolean - Is connection in progress?
    smartWalletPubkey,  // PublicKey | null - The user's Solana address
    wallet,             // WalletInfo | null - Full wallet details
    error: walletError, // Error | null - Any error from SDK
    
    // Actions
    connect,            // () => Promise<WalletInfo> - Start connection
    disconnect,         // () => Promise<void> - Disconnect wallet
  } = useWallet();

  // Local state for UI feedback
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Handler: Connect Wallet
  // ─────────────────────────────────────────────────────────────────────────
  const handleConnect = async () => {
    setError(null);

    try {
      // This triggers the passkey authentication flow:
      // 1. Opens Lazorkit portal popup
      // 2. User authenticates with biometrics
      // 3. Returns wallet info if successful
      const walletInfo = await connect();
      
      console.log('✅ Connected!', {
        smartWallet: walletInfo.smartWallet,    // Your Solana address
        credentialId: walletInfo.credentialId, // WebAuthn credential ID
        platform: walletInfo.platform,         // 'web', 'macIntel', etc.
      });
    } catch (err) {
      // Handle user cancellation gracefully
      const message = err instanceof Error ? err.message : 'Unknown error';
      
      if (message.includes('cancelled') || message.includes('rejected')) {
        // User cancelled - don't show error
        return;
      }
      
      setError(message);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Handler: Disconnect Wallet
  // ─────────────────────────────────────────────────────────────────────────
  const handleDisconnect = async () => {
    try {
      await disconnect();
      console.log('👋 Disconnected');
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Connected State
  // ─────────────────────────────────────────────────────────────────────────
  if (isConnected && smartWalletPubkey) {
    const address = smartWalletPubkey.toString();
    const truncated = `${address.slice(0, 4)}...${address.slice(-4)}`;

    return (
      <div className="flex items-center gap-4">
        {/* Wallet Address */}
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-mono">{truncated}</span>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Disconnected State
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
      >
        {isConnecting ? (
          <>
            <Spinner />
            Connecting...
          </>
        ) : (
          <>
            🔐 Connect with Passkey
          </>
        )}
      </button>

      {/* Error Message */}
      {(error || walletError) && (
        <p className="text-red-500 text-sm">
          {error || walletError?.message}
        </p>
      )}
    </div>
  );
}

// Simple spinner component
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5\" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
```

---

## 🛠️ Step 5: Use It In Your App

```typescript
// src/App.tsx
import { WalletProvider } from './providers/WalletProvider';
import { ConnectButton } from './components/ConnectButton';

export default function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">
            My Passkey Wallet App
          </h1>
          <ConnectButton />
        </div>
      </div>
    </WalletProvider>
  );
}
```

---

## 🎯 Understanding the Wallet Object

After successful connection, you get a `WalletInfo` object:

```typescript
interface WalletInfo {
  // Your Solana wallet address (Base58 string)
  // Use this to receive funds and sign transactions
  smartWallet: string;
  
  // WebAuthn credential ID (Base64 string)
  // Used internally for authentication
  credentialId: string;
  
  // Raw passkey public key (33 bytes, compressed secp256r1)
  // Used for on-chain signature verification
  passkeyPubkey: number[];
  
  // Platform info (e.g., 'web', 'macIntel', 'windows')
  platform: string;
  
  // Optional user-chosen name
  accountName?: string;
}
```

**Important:** Always use `smartWallet` as the user's Solana address. This is the PDA controlled by their passkey.

---

## 🔄 Auto-Reconnect Behavior

Lazorkit automatically handles session persistence:

```typescript
// On first call to connect():
// 1. SDK checks localStorage for existing credentials
// 2. If found, tries to restore session WITHOUT popup
// 3. If no session or invalid, opens portal for fresh auth

// You don't need to do anything special!
// Just call connect() and let the SDK handle it
await connect();
```

---

## ✅ What You've Learned

1. **Passkeys vs Seed Phrases**: Passkeys are device-bound credentials that never leave your device
2. **Smart Wallets**: PDAs on Solana that are controlled by passkey signatures
3. **LazorkitProvider**: Wrapper that provides wallet context to your app
4. **useWallet Hook**: Access wallet state and actions
5. **Auto-Reconnect**: Sessions persist across page reloads

---

## 🚀 Next Steps

- [Tutorial 2: Sending Gasless Transactions](./02-gasless-transactions.md)
- [Tutorial 3: Session Persistence](./03-session-persistence.md)

---

## 🐛 Troubleshooting

### "Popup blocked" Error
Ensure the connect call is triggered by a user gesture (click event).

### "WebAuthn not supported" Error
WebAuthn requires:
- HTTPS (or localhost for development)
- Modern browser (Chrome 67+, Safari 14+, Firefox 60+)
- Device with biometric capability or security key

### "User cancelled" After Click
The user closed the portal or denied the passkey prompt. This is expected behavior.

---

*Happy building! 🎉*
