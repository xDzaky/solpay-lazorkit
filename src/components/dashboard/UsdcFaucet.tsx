// =============================================================================
// USDC FAUCET COMPONENT
// =============================================================================
// Button to get test USDC on devnet for testing the application
// Uses mock mode to add balance instantly for demo purposes
// =============================================================================

"use client";

import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Coins, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { MOCK_MODE, addMockBalance, logMockActivity } from "@/lib/mock-mode";
import confetti from "canvas-confetti";

interface UsdcFaucetProps {
  onSuccess?: () => void;
}

/**
 * UsdcFaucet Component
 * 
 * Provides a button for users to get test USDC for demo/testing purposes.
 * In mock mode, instantly adds 100 USDC to the user's balance.
 * On devnet, would trigger an actual faucet transaction (gasless via Lazorkit).
 * 
 * @example
 * ```tsx
 * <UsdcFaucet onSuccess={() => refreshBalance()} />
 * ```
 */
export function UsdcFaucet({ onSuccess }: UsdcFaucetProps) {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGetUsdc = async () => {
    if (!isConnected || !smartWalletPubkey) return;

    setIsLoading(true);
    setSuccess(false);

    try {
      if (MOCK_MODE) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Add 100 USDC (in smallest units - 6 decimals)
        const amount = 100_000_000; // 100 USDC
        addMockBalance(amount);
        
        logMockActivity("USDC Faucet", {
          wallet: smartWalletPubkey.toString(),
          amount: 100,
          unit: "USDC",
        });
      } else {
        // Real devnet faucet would go here
        // For now, still use mock since devnet USDC faucets are limited
        await new Promise((resolve) => setTimeout(resolve, 2000));
        addMockBalance(100_000_000);
      }

      setSuccess(true);
      
      // Celebration effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#8b5cf6", "#a855f7"],
      });

      onSuccess?.();

      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Faucet error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <CheckCircle className="w-5 h-5 text-emerald-600" />
        <div>
          <p className="text-sm font-medium text-emerald-800">+100 USDC Added!</p>
          <p className="text-xs text-emerald-600">Your test funds are ready</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleGetUsdc}
      disabled={isLoading || !isConnected}
      className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
    >
      {/* Animated background sparkles */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles className="absolute top-1 right-2 w-3 h-3 text-white/40 animate-pulse" />
        <Sparkles className="absolute bottom-2 left-3 w-2 h-2 text-white/30 animate-pulse delay-100" />
      </div>
      
      <div className="relative flex items-center gap-3">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Coins className="w-5 h-5" />
        )}
        <div className="text-left">
          <p className="text-sm font-semibold">
            {isLoading ? "Getting USDC..." : "Get Test USDC"}
          </p>
          <p className="text-xs text-white/80">
            {isLoading ? "Please wait" : "+100 USDC for testing"}
          </p>
        </div>
      </div>
    </button>
  );
}
