// =============================================================================
// USE SEND TRANSACTION HOOK
// =============================================================================
// Hook for sending SOL and USDC transactions
// Supports both mock mode and real transactions
// Includes SPL Memo for transaction transparency
// =============================================================================

"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { 
  PublicKey, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { 
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
import { 
  MOCK_MODE, 
  simulateDelay, 
  logMockActivity, 
  addMockTransaction,
  deductMockBalance,
  deductMockSolBalance,
  getMockBalance,
  getMockSolBalance,
} from "@/lib/mock-mode";
import { createTransferMemoInstruction } from "@/lib/spl-memo";
import { TOKENS, RPC_URL } from "@/lib/constants";

const USDC_MINT = TOKENS.USDC.mint;

interface SendResult {
  success: boolean;
  signature?: string;
  error?: string;
}

function generateMockSignature(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 88; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function useSendTransaction() {
  const { smartWalletPubkey, signAndSendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send SOL
  const sendSOL = useCallback(async (
    recipient: string,
    amount: number,
    memo?: string
  ): Promise<SendResult> => {
    setError(null);

    if (!smartWalletPubkey) {
      setError("Wallet not connected");
      return { success: false, error: "Wallet not connected" };
    }

    // Validate recipient address
    try {
      new PublicKey(recipient);
    } catch {
      setError("Invalid recipient address");
      return { success: false, error: "Invalid recipient address" };
    }

    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return { success: false, error: "Amount must be greater than 0" };
    }

    setIsProcessing(true);

    try {
      // MOCK MODE
      if (MOCK_MODE) {
        logMockActivity("Sending SOL (mock)", { recipient, amount });
        await simulateDelay(2000);
        
        // Deduct from mock balance
        const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
        deductMockSolBalance(lamports);
        
        const signature = generateMockSignature();
        
        addMockTransaction({
          fromAddress: smartWalletPubkey.toString(),
          toAddress: recipient,
          amount: amount,
          token: "SOL",
          description: memo || "SOL Transfer",
          type: "SEND",
        });
        
        logMockActivity("SOL sent successfully (mock)", { signature });
        return { success: true, signature };
      }

      // REAL MODE
      if (!signAndSendTransaction) {
        throw new Error("Sign function not available");
      }

      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: new PublicKey(recipient),
        lamports: Math.floor(amount * LAMPORTS_PER_SOL),
      });

      const signature = await signAndSendTransaction({
        instructions: [instruction],
      });

      return { success: true, signature };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send SOL";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsProcessing(false);
    }
  }, [smartWalletPubkey, signAndSendTransaction]);

  // Send USDC
  const sendUSDC = useCallback(async (
    recipient: string,
    amount: number,
    memo?: string
  ): Promise<SendResult> => {
    setError(null);

    if (!smartWalletPubkey) {
      setError("Wallet not connected");
      return { success: false, error: "Wallet not connected" };
    }

    // Validate recipient address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch {
      setError("Invalid recipient address");
      return { success: false, error: "Invalid recipient address" };
    }

    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return { success: false, error: "Amount must be greater than 0" };
    }

    setIsProcessing(true);

    try {
      // MOCK MODE
      if (MOCK_MODE) {
        logMockActivity("Sending USDC (mock)", { recipient, amount });
        
        const requiredAmount = amount * 1_000_000;
        const currentBalance = getMockBalance();
        
        if (currentBalance < requiredAmount) {
          throw new Error(`Insufficient balance. Need $${amount}, have $${(currentBalance / 1_000_000).toFixed(2)}`);
        }
        
        await simulateDelay(2000);
        
        const signature = generateMockSignature();
        
        deductMockBalance(requiredAmount);
        
        addMockTransaction({
          fromAddress: smartWalletPubkey.toString(),
          toAddress: recipient,
          amount: amount,
          token: "USDC",
          description: memo || "USDC Transfer",
          type: "SEND",
        });
        
        logMockActivity("USDC sent successfully (mock)", { signature });
        return { success: true, signature };
      }

      // REAL MODE
      if (!signAndSendTransaction) {
        throw new Error("Sign function not available");
      }

      const usdcMint = new PublicKey(USDC_MINT);
      const connection = new Connection(RPC_URL);
      
      const senderATA = getAssociatedTokenAddressSync(usdcMint, smartWalletPubkey);
      const recipientATA = getAssociatedTokenAddressSync(usdcMint, recipientPubkey);

      const instructions = [];

      // Check if recipient has token account, if not create it
      try {
        await getAccount(connection, recipientATA);
      } catch {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            smartWalletPubkey,
            recipientATA,
            recipientPubkey,
            usdcMint
          )
        );
      }

      // Add transfer instruction
      instructions.push(
        createTransferInstruction(
          senderATA,
          recipientATA,
          smartWalletPubkey,
          Math.floor(amount * 1_000_000)
        )
      );

      const signature = await signAndSendTransaction({
        instructions,
      });

      return { success: true, signature };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send USDC";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsProcessing(false);
    }
  }, [smartWalletPubkey, signAndSendTransaction]);

  return {
    sendSOL,
    sendUSDC,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
}
