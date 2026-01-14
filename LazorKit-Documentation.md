## LazorKit Documentation

Documentation for LazorKit SDKs.

LazorKit allows you to build Passkey-native Solana applications.

Traditionally, crypto requires users to manage complex seed phrases. LazorKit replaces this with the standard biometrics users already know: FaceID, TouchID, or Windows Hello.

By leveraging WebAuthn and smart accounts (PDAs), LazorKit provides a seedless onboarding experience that is both secure and familiar—turning every device into a hardware wallet.
SDKs
React Native SDK

React Native bindings for iOS and Android. Implements native passkey integration and secure storage.

React Native Documentation →
React SDK

React hooks and components for web applications. Supports browser-based WebAuthn authentication.

React Documentation →
Core Concepts
Biometric Authentication

LazorKit uses WebAuthn credentials (Passkeys) for signing. Instead of handling keys directly, a hardware-bound credential is created in your device's Secure Enclave (TouchID, FaceID, or Windows Hello). The secret material never leaves the device.
Smart Wallets

Accounts are Program Derived Addresses (PDAs) controlled by the LazorKit on-chain program.

    Recovery: Logic for key rotation and recovery.
    Policies: On-chain spending limits and access controls.
    Session Keys: Ephemeral keys for scoped application access.

Paymaster

The Paymaster service enables gas sponsorship. Transactions can be paid for by an external relayer, removing the requirement for users to hold SOL for network fees.
Resources

    GitHub
    Telegram
    Twitter

## React Native SDK

# Overview
LazorKit Wallet Mobile Adapter for React Native.
LazorKit React Native SDK

Native React Native adapter for LazorKit smart wallets.
Why LazorKit React Native?

    WebAuthn Security: Secure biometric authentication
    Gasless Transactions: Built-in paymaster integration
    Smart Wallets: Programmable accounts with account abstraction
    Native Experience: Opimitized for React Native & Expo mobile apps

# Getting Started
Complete guide to integrating the LazorKit React Native SDK.
Integration Guide
Default Configuration

Use these default values for quick integration on Devnet:

const DEFAULT_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  portalUrl: 'https://portal.lazor.sh',
  configPaymaster: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
    // apiKey: 'YOUR_API_KEY' // Optional
  }
};

1. Installation

npm install @lazorkit/wallet-mobile-adapter

2. Polyfills & Configuration

Since React Native doesn't have a standardized Node.js environment, some Solana libraries (like @solana/web3.js) need a little help to work correctly. You'll need to install a few polyfills.
Install Dependencies

npm install react-native-get-random-values react-native-url-polyfill buffer

Configure Entry Point

Add these imports to the very top of your entry file (e.g., app/_layout.tsx, index.js, or App.tsx):

import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';

global.Buffer = global.Buffer || Buffer;

    Note: If you're using Expo and run into issues with random values, make sure expo-crypto is installed.

3. Setup Provider

Wrap your application with LazorKitProvider. Ensure you have expo-web-browser installed.

// App.tsx
import { LazorKitProvider } from '@lazorkit/wallet-mobile-adapter';

export default function App() {
  return (
    <LazorKitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
      configPaymaster={{ 
        paymasterUrl: "https://kora.devnet.lazorkit.com" 
      }}
    >
      <HomeScreen />
    </LazorKitProvider>
  );
}

4. Authentication

Use the connect method to log a user in. You'll need to provide a redirectUrl so the app knows where to return after the user finishes signing in on the portal.

    Important: This redirectUrl must match the Custom URL Scheme you set up in your app.json (for Expo) or Info.plist (for iOS).

// ConnectScreen.tsx
import { useWallet } from '@lazorkit/wallet-mobile-adapter';
import { Button, View, Text } from 'react-native';

export function ConnectScreen() {
  const { connect, isConnected, wallet } = useWallet();
  const APP_SCHEME = 'myapp://home';

  if (isConnected) {
    return <Text>Welcome back, {wallet?.smartWallet}</Text>;
  }

  return (
    <Button 
      title="Connect with Passkey" 
      onPress={() => connect({ redirectUrl: APP_SCHEME })} 
    />
  );
}

5. Signing Messages

Sign messages by directing users to the portal.

// SignScreen.tsx
import { useWallet } from '@lazorkit/wallet-mobile-adapter';
import { Button } from 'react-native';

export function SignScreen() {
  const { signMessage } = useWallet();

  const handleSign = async () => {
    try {
      const signature = await signMessage(
        "Welcome to LazorKit!", 
        { redirectUrl: 'myapp://callback' }
      );
      console.log("Verified Signature:", signature);
    } catch (e) {
      console.error(e);
    }
  };

  return <Button title="Sign Message" onPress={handleSign} />;
}

6. Sending Transactions

Send SOL or execute instructions on-chain.

// TransferScreen.tsx
import { useWallet } from '@lazorkit/wallet-mobile-adapter';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from 'react-native';

export function TransferScreen() {
  const { signAndSendTransaction, wallet } = useWallet();

  const handleTransfer = async () => {
    if (!wallet) return;

    // 1. Create Instruction
    const ix = SystemProgram.transfer({
      fromPubkey: new PublicKey(wallet.smartWallet),
      toPubkey: new PublicKey("RECIPIENT_ADDRESS"),
      lamports: 0.01 * LAMPORTS_PER_SOL,
    });

    // 2. Sign and Send
    const signature = await signAndSendTransaction(
      { 
        instructions: [ix], 
        transactionOptions: { feeToken: 'USDC' } 
      },
      { redirectUrl: 'myapp://callback' }
    );
    console.log("Tx:", signature);
  };

  return <Button title="Send SOL" onPress={handleTransfer} />;
}

7. Next Steps
See the Troubleshooting guide for help with common issues like deep linking configuration.

# LazorKitProvider
API reference for the LazorKitProvider component.
LazorKitProvider

The LazorKitProvider component wraps your application to provide wallet context and handle SDK initialization.
Import

import { LazorKitProvider } from '@lazorkit/wallet-mobile-adapter';

Usage

function App() {
  return (
    <LazorKitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
      configPaymaster={{ 
        paymasterUrl: "https://kora.devnet.lazorkit.com" 
      }}
    >
      <YourApplication />
    </LazorKitProvider>
  );
}

Props
rpcUrl (optional)

    Type: string
    Description: Solana RPC endpoint URL. If not provided, defaults to mainnet-beta or devnet based on configuration? (Inferred from types, please verify default behavior if known, otherwise leave as identifying the endpoint).

portalUrl (optional)

    Type: string
    Default: "https://portal.lazor.sh"
    Description: LazorKit portal URL for wallet dialogs.

configPaymaster (optional)

    Type: { paymasterUrl: string, apiKey?: string }
    Description: Configuration for the paymaster service.

isDebug (optional)

    Type: boolean
    Description: Enable debug logging.

children

    Type: ReactNode
    Description: Your application components.

# useWallet
API reference for the useWallet hook.
useWallet

The useWallet hook provides methods to interact with the wallet on mobile.

import { useWallet } from '@lazorkit/wallet-mobile-adapter';

connect

Connects to the wallet, triggering a deep link to the portal if necessary.
Usage

const { connect } = useWallet();

await connect({ 
  redirectUrl: 'myapp://home',
  onSuccess: (wallet) => console.log('Connected:', wallet.smartWallet),
  onFail: (error) => console.error('Connection failed:', error)
});

Arguments
Property	Type	Required	Description
options	object	Yes	Connection options.
options.redirectUrl	string	Yes	App deep link for callbacks.
options.onSuccess	(wallet: WalletInfo) => void	No	Callback on success.
options.onFail	(error: Error) => void	No	Callback on error.
disconnect

Disconnects the wallet session locally.
Usage

const { disconnect } = useWallet();
await disconnect({
  onSuccess: () => console.log('Disconnected'),
  onFail: (e) => console.error(e)
});

Arguments
Property	Type	Required	Description
options	object	No	Disconnect options.
options.onSuccess	() => void	No	Callback on success.
options.onFail	(error: Error) => void	No	Callback on error.
signMessage

Signs a message via the portal.
Usage

const { signMessage } = useWallet();

await signMessage('Hello', { 
  redirectUrl: 'myapp://callback',
  onSuccess: (res) => console.log('Signature:', res.signature),
  onFail: (err) => console.error('Signing failed:', err)
});

Arguments
Property	Type	Required	Description
message	string	Yes	Message to sign.
options	object	Yes	Options object.
options.redirectUrl	string	Yes	App deep link.
options.onSuccess	(res: { signature: string }) => void	No	Callback on success.
options.onFail	(error: Error) => void	No	Callback on error.
Returns

Promise<{ signature: string; signedPayload: string }> - Object containing the signature and signed payload.
signAndSendTransaction

Signs and sends a transaction.
Usage
Usage

const { signAndSendTransaction } = useWallet();

await signAndSendTransaction(
  {
    instructions: [/* ... */],
    transactionOptions: { 
      feeToken: 'USDC',
      computeUnitLimit: 500_000,
    }
  }, 
  { 
    redirectUrl: 'myapp://callback',
    onSuccess: (sig) => console.log('Tx Configured:', sig),
    onFail: (err) => console.error('Tx Failed:', err)
  }
);

Arguments
Property	Type	Required	Description
payload	object	Yes	Transaction payload.
payload.instructions	TransactionInstruction[]	Yes	Array of instructions.
payload.transactionOptions	object	Yes	Config options.
transactionOptions.feeToken	string	No	Token address for gas fees (e.g. USDC).
transactionOptions.computeUnitLimit	number	No	Max compute units for the transaction.
transactionOptions.addressLookupTableAccounts	AddressLookupTableAccount[]	No	Lookup tables for versioned (v0) transactions.
transactionOptions.clusterSimulation	'devnet' | 'mainnet'	Yes	Network to use for simulation.
options	object	Yes	Options object.
options.redirectUrl	string	Yes	App deep link.
options.onSuccess	(sig: string) => void	No	Callback on success.
options.onFail	(error: Error) => void	No	Callback on error.
Returns
Promise<string> - The transaction signature.

# Types
API reference for common types and interfaces.
Types

Common TypeScript interfaces used throughout the SDK.
SignAndSendTransactionPayload

Payload structure for transaction signing.

interface SignAndSendTransactionPayload {
  readonly instructions: TransactionInstruction[];
  readonly transactionOptions: {
    readonly feeToken?: string;
    readonly addressLookupTableAccounts?: AddressLookupTableAccount[];
    readonly computeUnitLimit?: number;
    readonly clusterSimulation: 'devnet' | 'mainnet';
  };
}

WalletInfo

Represents the connected wallet's state.

interface WalletInfo {
  readonly credentialId: string;      // Unique WebAuthn credential ID (Base64). Used for authentication.
  readonly passkeyPubkey: number[];   // Raw public key bytes of the passkey.
  readonly smartWallet: string;       // **YOUR SOLANA WALLET ADDRESS** (Base58). Use this to receive funds.
  readonly walletDevice: string;      // Internal PDA for device management.
  readonly platform: string;          // Origin platform ('android' | 'ios').
}

SignOptions

Options passed to signMessage.

interface SignOptions {
  redirectUrl: string;
  onSuccess?: (result: any) => void;
  onFail?: (error: Error) => void;
}

## React SDK

# Overview
Introduction to the LazorKit React SDK.
LazorKit React SDK

LazorKit is the standard for WebAuthn smart wallets on Solana.
Why LazorKit?

    WebAuthn Security: Passkey authentication replaces seed phrases
    Gasless Transactions: Built-in paymaster integration
    Smart Wallets: Programmable accounts with account abstraction
    Better UX: Seamless session persistence and auto-reconnect

# Getting Started
Complete guide to integrating the LazorKit React SDK.
Integration Guide
Default Configuration

LazorKit comes with pre-configured defaults for Devnet. You can use these values to get started quickly:

const DEFAULT_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  portalUrl: 'https://portal.lazor.sh',
  paymasterConfig: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com'
  }
};

This guide walks through building a complete wallet integration.
1. Installation

npm install @lazorkit/wallet @coral-xyz/anchor @solana/web3.js

2. Polyfills & Configuration
Polyfills (Required)

The SDK relies on Node.js globals like Buffer. You must polyfill these depending on your framework.
Vite

Use vite-plugin-node-polyfills:

// vite.config.ts
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills(),
    // ...
  ],
});

Next.js

Next.js usually handles module resolution, but ensure you are running wallet logic on the client-side (use client). If you encounter Buffer errors, add this to your layout.tsx or provider:

// layout.tsx or providers.tsx
if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || require('buffer').Buffer;
}

Provider Implementation

// App.tsx
import { LazorkitProvider } from '@lazorkit/wallet';

const CONFIG = {
  RPC_URL: "https://api.devnet.solana.com",
  PORTAL_URL: "https://portal.lazor.sh",
  PAYMASTER: { 
    paymasterUrl: "https://kora.devnet.lazorkit.com" 
  }
};

export default function App() {
  return (
    <LazorkitProvider
      rpcUrl={CONFIG.RPC_URL}
      portalUrl={CONFIG.PORTAL_URL}
      paymasterConfig={CONFIG.PAYMASTER}
    >
      <MainContent />
    </LazorkitProvider>
  );
}

3. Connect Button

Create a component to handle user authentication.

// ConnectButton.tsx
import { useWallet } from '@lazorkit/wallet';

export function ConnectButton() {
  const { connect, disconnect, isConnected, isConnecting, wallet } = useWallet();

  if (isConnected && wallet) {
    return (
      <button onClick={() => disconnect()}>
        Disconnect ({wallet.smartWallet.slice(0, 6)}...)
      </button>
    );
  }

  return (
    <button onClick={() => connect()} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

4. Sending Transactions

Send SOL or execute instructions using the signAndSendTransaction method.

// TransferButton.tsx
import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export function TransferButton() {
  const { signAndSendTransaction, smartWalletPubkey } = useWallet();

  const handleTransfer = async () => {
    try {
      if (!smartWalletPubkey) return;

      // 1. Create Instruction
      const destination = new PublicKey('RECIPIENT_ADDRESS');
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: destination,
        lamports: 0.1 * LAMPORTS_PER_SOL
      });

      // 2. Sign and Send
      const signature = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: {
          feeToken: 'USDC' // Optional: Pay gas in USDC
        }
      });

      console.log('Transaction confirmed:', signature);
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  return <button onClick={handleTransfer}>Send 0.1 SOL</button>;
}

5. Next Steps
Check out the Troubleshooting guide if you encounter any issues, or explore the API Reference for more advanced usage.

# LazorkitProvider
API reference for the LazorkitProvider component.
LazorkitProvider

The LazorkitProvider handles all the initialization logic for the SDK. It wraps your app to provide the wallet context everywhere.
Import

import { LazorkitProvider } from '@lazorkit/wallet';

Usage

function App() {
  return (
    <LazorkitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
      paymasterConfig={{ 
        paymasterUrl: "https://kora.devnet.lazorkit.com" 
      }}
    >
      <YourApplication />
    </LazorkitProvider>
  );
}

Props
rpcUrl (required)

    Type: string
    Description: The full URL to your Solana RPC node (e.g., Helius, QuickNode, or standard Devnet).

portalUrl (optional)

    Type: string
    Default: 'https://portal.lazor.sh'
    Description: The URL for the LazorKit authentication portal. You generally don't need to change this unless you're self-hosting the portal.

paymasterConfig (optional)

    Type: { paymasterUrl: string, apiKey?: string }
    Description: Settings for the Paymaster service, which handles gas sponsorship.
        paymasterUrl: The API endpoint for the paymaster.
        apiKey: Your API key if the service requires one.

children

    Type: ReactNode
    Description: Your application components

# useWallet
API reference for the useWallet hook.
useWallet

The useWallet hook provides methods to interact with the wallet.

import { useWallet } from '@lazorkit/wallet';

connect

Trigger the connection flow. If the user has previously connected, this will try to restore their session automatically without showing a pop-up.
Usage

const { connect } = useWallet();
await connect({ feeMode: 'paymaster' });

Arguments
Property	Type	Required	Description
options	object	No	Connection options.
options.feeMode	'paymaster' | 'user'	No	Fee payment mode (default: 'paymaster').
Returns

Promise<WalletInfo> - The connected wallet info object.
disconnect

Signs the user out and wipes any cached session data from local storage.
Usage

const { disconnect } = useWallet();
await disconnect();

Returns

Promise<void>
signMessage

Requests the user to sign a plain text message using their passkey. This is useful for verifying ownership without sending a transaction.
Usage

const { signMessage } = useWallet();
const message = 'Hello LazorKit';
const { signature } = await signMessage(message);

Arguments
Property	Type	Required	Description
message	string	Yes	The message content to sign.
Returns

Promise<{ signature: string, signedPayload: string }>
signAndSendTransaction

The core method for executing on-chain actions. It handles signing the transaction with the user's passkey and submitting it via the Paymaster (bundler).
Usage

const { signAndSendTransaction } = useWallet();

const signature = await signAndSendTransaction({
  instructions: [/* ... */],
  transactionOptions: {
    feeToken: 'USDC',
    computeUnitLimit: 500_000
  }
});

Arguments
Property	Type	Required	Description
payload	object	Yes	Transaction payload.
payload.instructions	TransactionInstruction[]	Yes	Array of Solana instructions.
payload.transactionOptions	object	No	Configuration options.
transactionOptions.feeToken	string	No	Token address for gas fees (e.g. USDC).
transactionOptions.computeUnitLimit	number	No	Max compute units for the transaction.
transactionOptions.addressLookupTableAccounts	AddressLookupTableAccount[]	No	Lookup tables for versioned (v0) transactions.
transactionOptions.clusterSimulation	'devnet' | 'mainnet'	No	Network to use for simulation.
Returns
Promise<string> - The transaction signature.

# Type Definitions
TypeScript definitions for LazorKit React SDK.
Type Definitions
Core Types
SignAndSendTransactionPayload

Payload structure for transaction signing.

interface SignAndSendTransactionPayload {
  instructions: TransactionInstruction[];
  transactionOptions?: {
    feeToken?: string;
    addressLookupTableAccounts?: AddressLookupTableAccount[];
    computeUnitLimit?: number;
    clusterSimulation?: 'devnet' | 'mainnet';
  };
}

WalletInfo

Connected wallet information.

interface WalletInfo {
  credentialId: string;           // Unique WebAuthn credential ID (Base64). Authentication.
  passkeyPubkey: number[];        // Raw public key bytes of the passkey.
  smartWallet: string;            // **YOUR SOLANA WALLET ADDRESS** (Base58). Use this for funds.
  walletDevice: string;           // Internal PDA for device management.
  platform: string;               // Platform info (e.g. 'web', 'macIntel').
  accountName?: string;           // The user's account name (if available).
}

## Wallet Standard

# Wallet Standard
Integration with Solana Wallet Adapter and other frameworks.
Wallet Standard Support

The LazorKit SDK supports the Solana Wallet Standard, enabling compatibility with popular libraries like @solana/wallet-adapter-react.
Integration with @solana/wallet-adapter-react
Default Configuration

// Standard Devnet Configuration

export const DEFAULT_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  portalUrl: 'https://portal.lazor.sh',
  paymasterConfig: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
    // apiKey: 'YOUR_API_KEY' // Optional
  },
  clusterSimulation: 'devnet'
};

You can use LazorKit seamlessly alongside other standard wallets (like Phantom, Solflare) in your existing provider setup.
1. Installation

Install the necessary dependencies:

npm install @lazorkit/wallet @solana/wallet-adapter-react @solana/wallet-adapter-react-ui

2. Register the Wallet

Call registerLazorkitWallet with your config. This adds LazorKit to the list of wallets so your adapter can find it.
For Next.js / SSR Apps (Recommended)

Use useEffect to ensure registration happens only on the client-side, as the Wallet Standard relies on the global window object.
For Create React App / Vite (SPA)

You can call this at the top level of your entry file if you don't need runtime configuration.
3. Setup Provider

Here is an example setup using ConnectionProvider and WalletProvider:

import { useMemo, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { registerLazorkitWallet } from '@lazorkit/wallet';

// Configuration
const CONFIG = {
  RPC_URL: "https://api.devnet.solana.com",
  PORTAL_URL: "https://portal.lazor.sh",
  PAYMASTER: {
    paymasterUrl: "https://kora.devnet.lazorkit.com",
    apiKey: "YOUR_API_KEY" 
  },
  CLUSTER: 'devnet'
};

export function AppProviders({ children }) {
  // Register LazorKit once on mount
  useEffect(() => {
    registerLazorkitWallet({
        rpcUrl: CONFIG.RPC_URL,
        portalUrl: CONFIG.PORTAL_URL,
        paymasterConfig: CONFIG.PAYMASTER,
        clusterSimulation: CONFIG.CLUSTER,
    });
  }, []);

  const wallets = useMemo(
    () => [
      // Standard wallets are automatically detected. 
      // LazorKit will appear here after registration.
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={CONFIG.RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

Usage in Components

Once connected, you can use the standard useWallet hook from @solana/wallet-adapter-react:

import { useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, PublicKey } from '@solana/web3.js';

export function TransferButton() {
  const { publicKey, sendTransaction } = useWallet();

  const handleSend = async () => {
    if (!publicKey) return;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey("RECIPIENT"),
        lamports: 1000,
      })
    );

    // LazorKit abstracts the Paymaster logic internally here
    const signature = await sendTransaction(transaction, connection);
    console.log("Sig:", signature);
  };

  return <button onClick={handleSend}>Send SOL</button>;
}

Message Signing & Verification (P256)

WebAuthn keys use the P256 curve (secp256r1), which works differently than standard Solana Ed25519 keys. The signMessage function returns a JSON object containing two critical pieces of data:

    signature: The signature produced by the WebAuthn authenticator.
    signedPayload: The exact byte sequence that was signed by the authenticator, encoded as base64

Why two values?

In WebAuthn, the authenticator does not sign the challenge directly. Instead, the browser constructs clientDataJSON (which includes the challenge, origin, and operation type), and the authenticator signs a payload derived from both:

    Browser data (clientDataJSON)

    Authenticator data (authenticatorData)

Because this signed payload cannot be reconstructed from the challenge alone, the verifier must know the exact bytes that were signed in order to validate the signature.

For this reason, signedPayload is returned alongside the signature.

Here's how to decode and use them:

import { useWallet } from '@solana/wallet-adapter-react';

export function SignAndVerify() {
  const { signMessage } = useWallet();

  const handleSign = async () => {
    if (!signMessage) return;

    const message = new TextEncoder().encode("Please verify ownership");
    
    // 1. Sign the message
    const result = await signMessage(message);

    // 2. Decode the result
    const jsonString = new TextDecoder().decode(result);
    const { signature, signedPayload } = JSON.parse(jsonString);

    console.log("Signature:", signature);
    console.log("Original Callenge:", signedPayload);

    // 3. Verify (Conceptual)
    // verify(publicKey, signedPayload, signature);
  };

  return <button onClick={handleSign}>Sign Message</button>;
}

How It Works

    Register: The register function sets up the LazorKit adapter.
    Discover: Your wallet provider sees the new adapter and adds it to the list.
    Transact: When you send a transaction, LazorKit handles the gas sponsorship (Paymaster) and signing logic automatically.

    Note: LazorKit behaves like any other wallet to your app, but uses smart contracts and passkeys under the hood.

## Troubleshooting
Common issues and solutions for LazorKit SDKs.
Troubleshooting
General Debugging

Enable debug mode in your LazorKitProvider (or LazorkitProvider for React) to see detailed logs about connection attempts, signing flows, and errors.

<LazorKitProvider isDebug={true} ... />

This will log detailed information to the console.
Common Issues
Transaction Failed

    Paymaster Config: Verify your paymasterUrl and apiKey are correct.
    Compute Units: Complex transactions may require higher compute unit limits. Try increasing computeUnitLimit in transactionOptions.
    Insufficient Funds: Even with a paymaster, some operations might require the smart wallet to have a minimum balance if not fully sponsored.

"Wallet not connected" Error

Ensure you are wrapping your application with the Provider component and that the component calling useWallet is a child of the provider.
React Native Specific
"Cannot resolve module"

Ensure you have installed all peer dependencies and configured polyfills correctly. See the Installation guide.
WebAuthn / Deep Linking Issues

    HTTPS: WebAuthn requires a secure context (HTTPS) or localhost (for development).
    Redirect URL: Ensure your redirectUrl matches exactly what is configured in your app's scheme (Info.plist / app.json).
    Deep Linking Logs: Check native logs (npx expo start) for any reported linking errors if the app doesn't open.

React SDK Specific
Dialog Does Not Open

    Browser Blocking: Some browsers block popups. Ensure the portal popup is allowed.
    Network: Verify connectivity to the LazorKit portal.

Support
If you continue to experience issues, please report them on our GitHub Issues page.