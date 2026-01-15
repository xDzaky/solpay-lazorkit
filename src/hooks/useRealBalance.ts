// =============================================================================
// USE REAL BALANCE HOOK
// =============================================================================
// Fetches real SOL and USDC balance from blockchain
// Includes simulated swap adjustments for demo purposes
// Falls back to mock balance in mock mode
// =============================================================================

"use client";

import { useWallet } from "@lazorkit/wallet";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TOKENS, RPC_URL } from "@/lib/constants";

const USDC_MINT = TOKENS.USDC.mint;
import { MOCK_MODE, getMockBalance, getMockSolBalance } from "@/lib/mock-mode";
import { useEffect, useState } from "react";

// localStorage keys for simulated swap balances (shared with swap page)
const SWAP_STORAGE_KEYS = {
  SOL_ADJUSTMENT: 'solpay_swap_sol_adjustment',
  USDC_ADJUSTMENT: 'solpay_swap_usdc_adjustment',
};

// Helper to get swap adjustment from localStorage
function getSwapAdjustment(key: string): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(key);
  return stored ? parseFloat(stored) : 0;
}

export function useRealBalance() {
  const { smartWalletPubkey, isConnected } = useWallet();
  const queryClient = useQueryClient();
  const [mockUsdcBalance, setMockUsdcBalance] = useState(0);
  const [mockSolBalance, setMockSolBalance] = useState(0);
  
  // Simulated swap adjustments
  const [solAdjustment, setSolAdjustment] = useState(0);
  const [usdcAdjustment, setUsdcAdjustment] = useState(0);
  
  // Poll mock balances and swap adjustments
  useEffect(() => {
    const update = () => {
      if (MOCK_MODE) {
        setMockUsdcBalance(getMockBalance() / 1_000_000);
        setMockSolBalance(getMockSolBalance() / 1_000_000_000);
      }
      // Always update swap adjustments
      setSolAdjustment(getSwapAdjustment(SWAP_STORAGE_KEYS.SOL_ADJUSTMENT));
      setUsdcAdjustment(getSwapAdjustment(SWAP_STORAGE_KEYS.USDC_ADJUSTMENT));
    };
    update();
    
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // SOL Balance (real)
  const { data: solBalance, isLoading: solLoading, refetch: refetchSol } = useQuery({
    queryKey: ["sol-balance", smartWalletPubkey?.toString()],
    queryFn: async () => {
      if (!smartWalletPubkey) return 0;
      
      if (MOCK_MODE) {
        // In mock mode, return mock SOL balance (10 SOL default)
        return getMockSolBalance() / 1_000_000_000;
      }
      
      try {
        const connection = new Connection(RPC_URL);
        const balance = await connection.getBalance(smartWalletPubkey);
        return balance / LAMPORTS_PER_SOL;
      } catch (err) {
        console.error("Failed to fetch SOL balance:", err);
        return 0;
      }
    },
    enabled: isConnected && !!smartWalletPubkey,
    refetchInterval: MOCK_MODE ? 2000 : 30000,
    staleTime: MOCK_MODE ? 1000 : 10000,
  });
  
  // USDC Balance (real or mock)
  const { data: usdcBalance, isLoading: usdcLoading, refetch: refetchUsdc } = useQuery({
    queryKey: ["usdc-balance", smartWalletPubkey?.toString()],
    queryFn: async () => {
      if (!smartWalletPubkey) return 0;
      
      if (MOCK_MODE) {
        return getMockBalance() / 1_000_000;
      }
      
      try {
        const connection = new Connection(RPC_URL);
        const usdcMint = new PublicKey(USDC_MINT);
        const ata = getAssociatedTokenAddressSync(usdcMint, smartWalletPubkey);
        const account = await getAccount(connection, ata);
        return Number(account.amount) / 1_000_000;
      } catch {
        // Token account doesn't exist
        return 0;
      }
    },
    enabled: isConnected && !!smartWalletPubkey,
    refetchInterval: MOCK_MODE ? 2000 : 30000,
    staleTime: MOCK_MODE ? 1000 : 10000,
  });

  const refresh = () => {
    refetchSol();
    refetchUsdc();
    // Also refresh swap adjustments
    setSolAdjustment(getSwapAdjustment(SWAP_STORAGE_KEYS.SOL_ADJUSTMENT));
    setUsdcAdjustment(getSwapAdjustment(SWAP_STORAGE_KEYS.USDC_ADJUSTMENT));
  };

  // Calculate final balances (real/mock + swap adjustments)
  const baseSolBalance = MOCK_MODE ? mockSolBalance : (solBalance ?? 0);
  const baseUsdcBalance = MOCK_MODE ? mockUsdcBalance : (usdcBalance ?? 0);

  return {
    // Raw blockchain/mock balance
    rawSolBalance: baseSolBalance,
    rawUsdcBalance: baseUsdcBalance,
    // Effective balance including swap simulation
    solBalance: Math.max(0, baseSolBalance + solAdjustment),
    usdcBalance: Math.max(0, baseUsdcBalance + usdcAdjustment),
    // Swap adjustments (for display purposes)
    solAdjustment,
    usdcAdjustment,
    hasSwapSimulation: solAdjustment !== 0 || usdcAdjustment !== 0,
    isLoading: solLoading || usdcLoading,
    isMock: MOCK_MODE,
    refresh,
  };
}
