"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { buildSubscriptionPaymentInstruction } from "@/lib/solana";
import { 
  MOCK_MODE, 
  simulateDelay, 
  logMockActivity, 
  addMockTransaction,
  deductMockBalance,
  getMockBalance,
  setMockSubscription
} from "@/lib/mock-mode";
import type { TransferResult } from "@/types";

/**
 * Generate a mock transaction signature
 */
function generateMockSignature(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 88; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Hook for handling subscription payments
 * Demonstrates gasless USDC transfers via Lazorkit SDK
 * Supports mock mode for testing without real USDC
 */
export function useSubscribe() {
  const { smartWalletPubkey, signAndSendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(
    async (
      planId: string,
      planName: string,
      priceUSDC: number
    ): Promise<TransferResult> => {
      setError(null);

      if (!smartWalletPubkey) {
        const message = "Wallet not connected";
        setError(message);
        return { success: false, error: message };
      }

      setIsProcessing(true);

      try {
        // ─────────────────────────────────────────────────────────────────────
        // MOCK MODE: Simulate transaction without real blockchain interaction
        // ─────────────────────────────────────────────────────────────────────
        if (MOCK_MODE) {
          logMockActivity("Starting mock subscription", { planId, planName, priceUSDC });
          
          // Check if user has enough balance
          const currentBalance = getMockBalance();
          const requiredAmount = priceUSDC * 1_000_000; // Convert to smallest unit
          
          if (currentBalance < requiredAmount) {
            const message = `Insufficient USDC balance. Need $${priceUSDC}, have $${(currentBalance / 1_000_000).toFixed(2)}`;
            setError(message);
            return { success: false, error: message };
          }

          // Simulate processing delay
          await simulateDelay(2000);
          
          // Generate mock signature
          const signature = generateMockSignature();
          
          // Deduct from mock balance
          deductMockBalance(requiredAmount);
          
          // Record mock transaction
          addMockTransaction({
            from: smartWalletPubkey.toString(),
            to: "EyJfxrAxws2VZaPnU8ifQ6NoH7B7XBVDbqrfX191cqYU", // Vault
            amount: requiredAmount,
            token: "USDC",
            planId,
            planName,
            type: "SUBSCRIPTION_PAYMENT",
          });
          
          // Set mock subscription
          const now = new Date();
          const endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + 1);
          
          setMockSubscription({
            id: `sub_mock_${Date.now()}`,
            planId,
            planName,
            priceUsdc: requiredAmount,
            status: "ACTIVE",
            startDate: now,
            endDate,
            transactionSignature: signature,
          });
          
          logMockActivity("Mock subscription successful", { 
            signature, 
            newBalance: getMockBalance() 
          });
          
          // Also record in database (optional in mock mode)
          try {
            await fetch("/api/subscriptions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                walletAddress: smartWalletPubkey.toString(),
                planId,
                transactionSignature: signature,
                amountPaid: priceUSDC,
              }),
            });
          } catch (dbError) {
            // Database recording is optional in mock mode
            console.warn("Mock: Database recording failed, continuing anyway", dbError);
          }
          
          return { success: true, signature };
        }

        // ─────────────────────────────────────────────────────────────────────
        // LIVE MODE: Real blockchain transaction
        // ─────────────────────────────────────────────────────────────────────
        
        if (!signAndSendTransaction) {
          const message = "Sign function not available";
          setError(message);
          return { success: false, error: message };
        }
        // ─────────────────────────────────────────────────────────────────────
        // Step 1: Build the USDC transfer instruction
        // ─────────────────────────────────────────────────────────────────────
        console.log(`📦 Building payment for ${planName}: $${priceUSDC} USDC`);

        const instructions = await buildSubscriptionPaymentInstruction(
          smartWalletPubkey.toString(),
          priceUSDC
        );

        // ─────────────────────────────────────────────────────────────────────
        // Step 2: Sign and send via Lazorkit (gasless!)
        // ─────────────────────────────────────────────────────────────────────
        console.log("✍️ Requesting passkey signature...");

        const signature = await signAndSendTransaction({
          instructions,
        });

        console.log("✅ Transaction confirmed:", signature);

        // ─────────────────────────────────────────────────────────────────────
        // Step 3: Record in database
        // ─────────────────────────────────────────────────────────────────────
        console.log("📝 Recording subscription...");

        await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: smartWalletPubkey.toString(),
            planId,
            transactionSignature: signature,
            amountPaid: priceUSDC,
          }),
        });

        return { success: true, signature };
      } catch (err) {
        console.error("❌ Subscription failed:", err);

        const message = err instanceof Error ? err.message : "Unknown error";

        // Handle user cancellation gracefully
        if (message.includes("cancelled") || message.includes("rejected")) {
          setError("Transaction cancelled");
          return { success: false, error: "Transaction cancelled by user" };
        }

        setError(message);
        return { success: false, error: message };
      } finally {
        setIsProcessing(false);
      }
    },
    [smartWalletPubkey, signAndSendTransaction]
  );

  return {
    subscribe,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
}
