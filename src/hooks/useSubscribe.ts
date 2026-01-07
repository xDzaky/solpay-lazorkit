"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { buildSubscriptionPaymentInstruction } from "@/lib/solana";
import type { TransferResult } from "@/types";

/**
 * Hook for handling subscription payments
 * Demonstrates gasless USDC transfers via Lazorkit SDK
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

      if (!signAndSendTransaction) {
        const message = "Sign function not available";
        setError(message);
        return { success: false, error: message };
      }

      setIsProcessing(true);

      try {
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
