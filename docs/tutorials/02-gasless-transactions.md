# 📖 Tutorial 2: Sending Gasless Transactions

> **Time to complete:** ~15 minutes
> 
> **Prerequisites:** Completed [Tutorial 1: Passkey Wallet Setup](./01-passkey-wallet-setup.md)

---

## Overview

In this tutorial, you'll learn how to send gasless USDC transactions using Lazorkit's paymaster integration. By the end, you'll understand:

1. How gasless transactions work (Paymaster concept)
2. Building Solana instructions for token transfers
3. Signing and submitting via Lazorkit SDK
4. Handling transaction states and errors

---

## 🧠 Understanding Gasless Transactions

### Traditional Flow (User Pays Gas)
```
User → Build TX → Sign → Pay SOL Gas → Submit → Confirm
```

### Gasless Flow (Paymaster Pays)
```
User → Build TX → Sign → Paymaster Pays Gas ✨ → Submit → Confirm
```

### How the Paymaster Works

```
┌──────────┐      ┌──────────────┐      ┌───────────────┐      ┌──────────┐
│  User    │─────▶│  Your App    │─────▶│  Paymaster    │─────▶│  Solana  │
│          │      │  (Build TX)  │      │  (Kora)       │      │  Network │
└──────────┘      └──────────────┘      └───────────────┘      └──────────┘
                         │                      │
                         │                      │
                         ▼                      │
                  ┌──────────────┐              │
                  │  Lazorkit    │◀─────────────┘
                  │  SDK         │  Pays SOL fee, returns signature
                  │  signAndSend │
                  └──────────────┘
```

**Key Points:**
- **Paymaster (Kora)** = Service that pays transaction fees on user's behalf
- **Users never need SOL** = They can transact with just USDC
- **Fully sponsored** = The bounty demo subsidizes all fees

---

## 🛠️ Step 1: Setup Token Constants

```typescript
// src/lib/constants.ts

// USDC Token on Devnet
export const USDC_MINT = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';

// Decimals for USDC (6 decimals = 1 USDC = 1,000,000 units)
export const USDC_DECIMALS = 6;

// Helper to convert human-readable amount to token units
export function toTokenAmount(amount: number, decimals: number = USDC_DECIMALS): bigint {
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}

// Helper to convert token units to human-readable
export function fromTokenAmount(amount: bigint, decimals: number = USDC_DECIMALS): number {
  return Number(amount) / Math.pow(10, decimals);
}
```

---

## 🛠️ Step 2: Install SPL Token Library

```bash
npm install @solana/spl-token
```

---

## 🛠️ Step 3: Build the Transfer Instruction

```typescript
// src/lib/solana.ts

import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from '@solana/spl-token';

const RPC_URL = 'https://api.devnet.solana.com';
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

/**
 * Get a Solana connection instance
 */
export function getConnection(): Connection {
  return new Connection(RPC_URL, 'confirmed');
}

/**
 * Build instructions for a USDC transfer
 * 
 * @param from - Sender's smart wallet address
 * @param to - Recipient's wallet address
 * @param amount - Amount in USDC (human-readable, e.g., 10.5 for 10.5 USDC)
 * @returns Array of TransactionInstructions
 */
export async function buildUsdcTransferInstructions(
  from: PublicKey,
  to: PublicKey,
  amount: number
): Promise<TransactionInstruction[]> {
  const connection = getConnection();
  const instructions: TransactionInstruction[] = [];
  
  // Convert amount to token units (6 decimals)
  const amountInUnits = BigInt(Math.floor(amount * 1_000_000));
  
  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Get Associated Token Accounts (ATAs)
  // ─────────────────────────────────────────────────────────────────────────
  
  // Sender's ATA for USDC
  const senderATA = getAssociatedTokenAddressSync(USDC_MINT, from, true); // allowOwnerOffCurve=true for PDAs
  
  // Recipient's ATA for USDC
  const recipientATA = getAssociatedTokenAddressSync(USDC_MINT, to, true);
  
  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: Check if recipient's ATA exists
  // ─────────────────────────────────────────────────────────────────────────
  
  const recipientATAInfo = await connection.getAccountInfo(recipientATA);
  
  if (!recipientATAInfo) {
    // Create the recipient's ATA if it doesn't exist
    // Note: The fee payer (paymaster) will pay the rent
    instructions.push(
      createAssociatedTokenAccountInstruction(
        from,          // payer (will be overridden by paymaster)
        recipientATA,  // ATA to create
        to,            // owner of the ATA
        USDC_MINT      // token mint
      )
    );
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // Step 3: Add the transfer instruction
  // ─────────────────────────────────────────────────────────────────────────
  
  instructions.push(
    createTransferInstruction(
      senderATA,      // source
      recipientATA,   // destination
      from,           // owner (authority)
      amountInUnits   // amount in smallest units
    )
  );
  
  return instructions;
}
```

---

## 🛠️ Step 4: Create the Transfer Function

```typescript
// src/lib/transfer.ts

import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { buildUsdcTransferInstructions } from './solana';

/**
 * Represents the result of a transfer operation
 */
export interface TransferResult {
  success: boolean;
  signature?: string;
  error?: string;
}

/**
 * Transfer USDC from the connected wallet to a recipient
 * 
 * @param signAndSendTransaction - Function from useWallet hook
 * @param fromAddress - Sender's smart wallet address (string)
 * @param toAddress - Recipient's wallet address (string)
 * @param amount - Amount in USDC (human-readable)
 * @returns TransferResult with signature or error
 */
export async function transferUsdc(
  signAndSendTransaction: (instructions: TransactionInstruction[]) => Promise<string>,
  fromAddress: string,
  toAddress: string,
  amount: number
): Promise<TransferResult> {
  try {
    // Validate amount
    if (amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }
    
    // Validate addresses
    const from = new PublicKey(fromAddress);
    const to = new PublicKey(toAddress);
    
    // ─────────────────────────────────────────────────────────────────────────
    // Build the transaction instructions
    // ─────────────────────────────────────────────────────────────────────────
    console.log('📦 Building transfer instructions...');
    const instructions = await buildUsdcTransferInstructions(from, to, amount);
    
    console.log(`📋 Instructions count: ${instructions.length}`);
    
    // ─────────────────────────────────────────────────────────────────────────
    // Sign and send via Lazorkit SDK
    // This is where the magic happens:
    // 1. SDK wraps instructions in a transaction
    // 2. User signs with their passkey (biometric prompt)
    // 3. Paymaster pays the SOL gas fee
    // 4. Transaction is submitted to Solana
    // ─────────────────────────────────────────────────────────────────────────
    console.log('✍️ Requesting signature...');
    const signature = await signAndSendTransaction(instructions);
    
    console.log('✅ Transaction sent!', signature);
    
    return {
      success: true,
      signature,
    };
  } catch (error) {
    console.error('❌ Transfer failed:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: message,
    };
  }
}
```

---

## 🛠️ Step 5: Build the Transfer UI Component

```typescript
// src/components/TransferForm.tsx

'use client';

import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { transferUsdc } from '../lib/transfer';

/**
 * TransferForm
 * 
 * A form component for sending USDC to any Solana address.
 * Demonstrates gasless transactions via Lazorkit SDK.
 */
export function TransferForm() {
  // ─────────────────────────────────────────────────────────────────────────
  // Wallet State from Lazorkit SDK
  // ─────────────────────────────────────────────────────────────────────────
  const {
    isConnected,
    smartWalletPubkey,
    signAndSendTransaction, // 🔥 The key function for gasless TX!
  } = useWallet();
  
  // ─────────────────────────────────────────────────────────────────────────
  // Form State
  // ─────────────────────────────────────────────────────────────────────────
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
    signature?: string;
  } | null>(null);
  
  // ─────────────────────────────────────────────────────────────────────────
  // Handle Form Submit
  // ─────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    
    if (!smartWalletPubkey || !signAndSendTransaction) {
      setResult({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }
    
    // Validate inputs
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setResult({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }
    
    if (!recipient || recipient.length < 32) {
      setResult({ type: 'error', message: 'Please enter a valid Solana address' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // ─────────────────────────────────────────────────────────────────────────
      // Execute the gasless transfer
      // ─────────────────────────────────────────────────────────────────────────
      const transferResult = await transferUsdc(
        signAndSendTransaction,
        smartWalletPubkey.toString(),
        recipient,
        parsedAmount
      );
      
      if (transferResult.success && transferResult.signature) {
        setResult({
          type: 'success',
          message: `Successfully sent ${amount} USDC!`,
          signature: transferResult.signature,
        });
        // Clear form
        setRecipient('');
        setAmount('');
      } else {
        setResult({
          type: 'error',
          message: transferResult.error || 'Transfer failed',
        });
      }
    } catch (err) {
      setResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // ─────────────────────────────────────────────────────────────────────────
  // Render: Not Connected
  // ─────────────────────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-600">Connect your wallet to send USDC</p>
      </div>
    );
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // Render: Transfer Form
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Send USDC</h2>
      
      {/* Gasless Badge */}
      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
        <span>✨</span>
        <span>Gasless Transfer - No SOL needed!</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (USDC)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !recipient || !amount}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner />
              Sending...
            </>
          ) : (
            <>Send USDC</>
          )}
        </button>
      </form>
      
      {/* Result Message */}
      {result && (
        <div className={`mt-4 p-4 rounded-lg ${
          result.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <p>{result.message}</p>
          {result.signature && (
            <a
              href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-sm underline"
            >
              View on Solana Explorer →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Spinner component
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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

## 🧪 Test Your Implementation

### 1. Get Devnet USDC

First, you'll need some USDC in your wallet. Use the Solana faucet or ask the community:

```bash
# Option 1: Use the token faucet on Devnet
# Go to: https://spl-token-faucet.com/

# Option 2: Mint test tokens (if you have authority)
spl-token mint Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr 1000 <YOUR_ATA>
```

### 2. Run Your App

```bash
npm run dev
```

### 3. Try a Transfer

1. Connect your passkey wallet
2. Enter a recipient address (try another wallet you control)
3. Enter amount (e.g., 1.0 USDC)
4. Click "Send USDC"
5. Authenticate with biometrics
6. View the transaction on Explorer!

---

## 🔍 Understanding signAndSendTransaction

The `signAndSendTransaction` function from `useWallet` does several things:

```typescript
const signature = await signAndSendTransaction(instructions);

// Under the hood:
// 1. Wraps instructions in a VersionedTransaction
// 2. Sets the paymaster as fee payer (NOT your wallet)
// 3. Gets recent blockhash
// 4. Opens passkey signing prompt (FaceID/TouchID)
// 5. User signs with device biometrics
// 6. Paymaster sponsors the gas fee
// 7. Submits to Solana network
// 8. Returns transaction signature
```

---

## 🎯 Complete Example: Subscription Payment

Here's how SolPay uses this for subscription payments:

```typescript
// src/hooks/useSubscribe.ts

import { useCallback, useState } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { PublicKey } from '@solana/web3.js';
import { buildUsdcTransferInstructions } from '../lib/solana';

// Treasury wallet that receives subscription payments
const TREASURY_WALLET = new PublicKey('TREASURY_ADDRESS_HERE');

interface SubscribeParams {
  planId: string;
  planName: string;
  priceUSDC: number;
}

export function useSubscribe() {
  const { smartWalletPubkey, signAndSendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const subscribe = useCallback(async (params: SubscribeParams) => {
    if (!smartWalletPubkey || !signAndSendTransaction) {
      throw new Error('Wallet not connected');
    }
    
    setIsProcessing(true);
    
    try {
      // 1. Build transfer instructions
      const instructions = await buildUsdcTransferInstructions(
        smartWalletPubkey,
        TREASURY_WALLET,
        params.priceUSDC
      );
      
      // 2. Execute gasless transaction
      const signature = await signAndSendTransaction(instructions);
      
      // 3. Record subscription in database
      await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: smartWalletPubkey.toString(),
          planId: params.planId,
          transactionSignature: signature,
          amountPaid: params.priceUSDC,
        }),
      });
      
      return { success: true, signature };
    } catch (error) {
      console.error('Subscription failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [smartWalletPubkey, signAndSendTransaction]);
  
  return { subscribe, isProcessing };
}
```

---

## ✅ What You've Learned

1. **Paymaster Concept**: A service that pays gas fees on users' behalf
2. **Building Instructions**: Creating SPL Token transfer instructions
3. **signAndSendTransaction**: The SDK function for gasless transactions
4. **Error Handling**: Proper error handling for blockchain operations
5. **Real-world Pattern**: How to build subscription payments

---

## 🚀 Next Steps

- [Tutorial 3: Session Persistence](./03-session-persistence.md)
- [Tutorial 4: Transaction History](./04-transaction-history.md)

---

## 🐛 Troubleshooting

### "Insufficient funds" Error
- Make sure you have USDC in your smart wallet (not SOL)
- Check the ATA balance, not the main wallet

### "Transaction simulation failed" Error
- The recipient address might be invalid
- The amount might exceed your balance
- The paymaster might be temporarily unavailable

### "User rejected the request" Error
- User cancelled the biometric prompt
- This is expected behavior, handle gracefully

### Transaction stuck "Processing"
- Solana network might be congested
- Wait 30-60 seconds and check Explorer
- The paymaster has retry logic built-in

---

*Keep building awesome stuff! 🚀*
