// =============================================================================
// DOCUMENTATION PAGE
// =============================================================================
// Setup guide, API reference, and code examples
// =============================================================================

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Book, 
  Code, 
  Terminal, 
  FileCode,
  Copy,
  ExternalLink,
  Github,
  Zap,
  Shield,
  Fingerprint,
  Package,
  Settings,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-indigo-50 to-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 text-indigo-600 mb-4">
            <Book className="w-6 h-6" />
            <span className="font-medium">Documentation</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Getting Started with SolPay
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl">
            Learn how to integrate Lazorkit SDK to build passwordless, gasless payment experiences on Solana.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <nav className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Getting Started</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#installation" className="text-indigo-600 hover:underline">Installation</a></li>
                  <li><a href="#configuration" className="text-slate-600 hover:text-indigo-600">Configuration</a></li>
                  <li><a href="#provider-setup" className="text-slate-600 hover:text-indigo-600">Provider Setup</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Core Concepts</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#authentication" className="text-slate-600 hover:text-indigo-600">Authentication</a></li>
                  <li><a href="#transactions" className="text-slate-600 hover:text-indigo-600">Transactions</a></li>
                  <li><a href="#gasless" className="text-slate-600 hover:text-indigo-600">Gasless TX</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Examples</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#send-sol" className="text-slate-600 hover:text-indigo-600">Send SOL</a></li>
                  <li><a href="#send-usdc" className="text-slate-600 hover:text-indigo-600">Send USDC</a></li>
                  <li><a href="#balance" className="text-slate-600 hover:text-indigo-600">Fetch Balance</a></li>
                </ul>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-12">
            {/* Installation */}
            <section id="installation">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-indigo-600" />
                Installation
              </h2>
              <p className="text-slate-600 mb-4">
                Install the required dependencies for your Next.js project:
              </p>
              <div className="bg-slate-900 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Terminal</span>
                  <button className="text-slate-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-emerald-400 text-sm overflow-x-auto">
{`# Using pnpm (recommended)
pnpm add @lazorkit/wallet @solana/web3.js @solana/spl-token

# Using npm
npm install @lazorkit/wallet @solana/web3.js @solana/spl-token

# Using yarn
yarn add @lazorkit/wallet @solana/web3.js @solana/spl-token`}
                </pre>
              </div>
            </section>

            {/* Configuration */}
            <section id="configuration">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-indigo-600" />
                Configuration
              </h2>
              <p className="text-slate-600 mb-4">
                Create a <code className="bg-slate-200 px-2 py-0.5 rounded text-sm">.env.local</code> file with your configuration:
              </p>
              <div className="bg-slate-900 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">.env.local</span>
                  <button className="text-slate-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-amber-400 text-sm overflow-x-auto">
{`# Lazorkit Configuration
NEXT_PUBLIC_LAZORKIT_PORTAL_URL=https://portal.lazor.sh
NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL=https://kora.devnet.lazorkit.com

# Solana Configuration  
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# USDC Token (Devnet)
NEXT_PUBLIC_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Mock Mode (for testing without real tokens)
NEXT_PUBLIC_MOCK_MODE=true`}
                </pre>
              </div>
            </section>

            {/* Provider Setup */}
            <section id="provider-setup">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-indigo-600" />
                Provider Setup
              </h2>
              <p className="text-slate-600 mb-4">
                Wrap your application with the LazorkitProvider:
              </p>
              <div className="bg-slate-900 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">src/providers/WalletProvider.tsx</span>
                </div>
                <pre className="text-slate-300 text-sm overflow-x-auto">
{`"use client";

import { LazorkitProvider } from "@lazorkit/wallet";

const config = {
  portalUrl: process.env.NEXT_PUBLIC_LAZORKIT_PORTAL_URL,
  paymasterUrl: process.env.NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL,
};

export function WalletProvider({ children }) {
  return (
    <LazorkitProvider config={config}>
      {children}
    </LazorkitProvider>
  );
}`}
                </pre>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Fingerprint className="w-6 h-6 text-indigo-600" />
                Authentication
              </h2>
              <p className="text-slate-600 mb-4">
                Use the <code className="bg-slate-200 px-2 py-0.5 rounded text-sm">useWallet</code> hook to handle authentication:
              </p>
              <div className="bg-slate-900 rounded-xl p-4 mb-4">
                <pre className="text-slate-300 text-sm overflow-x-auto">
{`"use client";

import { useWallet } from "@lazorkit/wallet";

export function ConnectButton() {
  const { 
    connect,       // Create new passkey
    reconnect,     // Login with existing passkey
    disconnect,    // Logout
    isConnected,   // Connection status
    isConnecting,  // Loading state
    smartWalletPubkey // User's wallet address
  } = useWallet();

  if (isConnected) {
    return (
      <div>
        <p>Connected: {smartWalletPubkey?.toString()}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={connect}>Create Account</button>
      <button onClick={reconnect}>Sign In</button>
    </div>
  );
}`}
                </pre>
              </div>
            </section>

            {/* Transactions */}
            <section id="transactions">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-indigo-600" />
                Sending Transactions
              </h2>
              <p className="text-slate-600 mb-4">
                Send gasless transactions using the signAndSendTransaction method:
              </p>
              
              <div id="send-sol" className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Send SOL</h3>
                <div className="bg-slate-900 rounded-xl p-4">
                  <pre className="text-slate-300 text-sm overflow-x-auto">
{`import { useWallet } from "@lazorkit/wallet";
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

function SendSOL() {
  const { smartWalletPubkey, signAndSendTransaction } = useWallet();

  const sendSOL = async (recipient: string, amount: number) => {
    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: new PublicKey(recipient),
      lamports: amount * LAMPORTS_PER_SOL,
    });

    // Transaction is automatically sponsored by Paymaster
    const signature = await signAndSendTransaction({
      instructions: [instruction],
    });

    console.log("Transaction:", signature);
  };

  return <button onClick={() => sendSOL("...", 0.1)}>Send 0.1 SOL</button>;
}`}
                  </pre>
                </div>
              </div>

              <div id="send-usdc">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Send USDC</h3>
                <div className="bg-slate-900 rounded-xl p-4">
                  <pre className="text-slate-300 text-sm overflow-x-auto">
{`import { createTransferInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";

const sendUSDC = async (recipient: string, amount: number) => {
  const usdcMint = new PublicKey(USDC_MINT);
  
  // Get token accounts
  const fromAta = getAssociatedTokenAddressSync(usdcMint, smartWalletPubkey);
  const toAta = getAssociatedTokenAddressSync(usdcMint, new PublicKey(recipient));

  const instruction = createTransferInstruction(
    fromAta,
    toAta,
    smartWalletPubkey,
    amount * 1_000_000 // USDC has 6 decimals
  );

  const signature = await signAndSendTransaction({
    instructions: [instruction],
  });
};`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Balance */}
            <section id="balance">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                Fetching Balance
              </h2>
              <div className="bg-slate-900 rounded-xl p-4 mb-4">
                <pre className="text-slate-300 text-sm overflow-x-auto">
{`import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";

const fetchBalances = async (walletPubkey: PublicKey) => {
  const connection = new Connection(RPC_URL);
  
  // SOL Balance
  const solBalance = await connection.getBalance(walletPubkey);
  const solAmount = solBalance / LAMPORTS_PER_SOL;
  
  // USDC Balance
  const usdcMint = new PublicKey(USDC_MINT);
  const ata = getAssociatedTokenAddressSync(usdcMint, walletPubkey);
  
  try {
    const account = await getAccount(connection, ata);
    const usdcAmount = Number(account.amount) / 1_000_000;
    return { sol: solAmount, usdc: usdcAmount };
  } catch {
    return { sol: solAmount, usdc: 0 };
  }
};`}
                </pre>
              </div>
            </section>

            {/* Resources */}
            <section className="pt-8 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Resources</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href="https://github.com/xDzaky/solpay-lazorkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">GitHub Repository</h3>
                    <p className="text-sm text-slate-500">View source code</p>
                  </div>
                </a>
                <a
                  href="https://lazorkit.xyz/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Book className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Lazorkit Docs</h3>
                    <p className="text-sm text-slate-500">Official SDK documentation</p>
                  </div>
                </a>
              </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to build?</h2>
              <p className="text-indigo-100 mb-6">
                Start building your own passwordless payment experience today.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors"
              >
                <Zap className="w-5 h-5" />
                Try the Demo
              </Link>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
