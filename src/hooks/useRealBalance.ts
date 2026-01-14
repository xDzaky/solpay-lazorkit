// =============================================================================
// USE REAL BALANCE HOOK
// =============================================================================
// Fetches real SOL and USDC balance from blockchain
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

export function useRealBalance() {
  const { smartWalletPubkey, isConnected } = useWallet();
  const queryClient = useQueryClient();
  const [mockUsdcBalance, setMockUsdcBalance] = useState(0);
  const [mockSolBalance, setMockSolBalance] = useState(0);
  
  // Poll mock balances
  useEffect(() => {
    if (!MOCK_MODE) return;
    
    const update = () => {
      setMockUsdcBalance(getMockBalance() / 1_000_000);
      setMockSolBalance(getMockSolBalance() / 1_000_000_000);
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
  };

  return {
    solBalance: MOCK_MODE ? mockSolBalance : (solBalance ?? 0),
    usdcBalance: MOCK_MODE ? mockUsdcBalance : (usdcBalance ?? 0),
    isLoading: solLoading || usdcLoading,
    isMock: MOCK_MODE,
    refresh,
  };
}
