// =============================================================================
// USE BALANCE HOOK
// =============================================================================
// Hook for fetching and caching wallet USDC balance with mock mode support
// =============================================================================

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsdcBalance } from "@/lib/solana";
import { MOCK_MODE, logMockActivity } from "@/lib/mock-mode";

interface UseBalanceOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

interface UseBalanceReturn {
  balance: number | undefined;
  formattedBalance: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to get USDC balance for a wallet address
 * Automatically uses mock balance when MOCK_MODE is enabled
 */
export function useBalance(
  walletAddress: string | null | undefined,
  options: UseBalanceOptions = {}
): UseBalanceReturn {
  const { enabled = true, refetchInterval = false } = options;
  const queryClient = useQueryClient();

  const {
    data: balance,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["balance", walletAddress, MOCK_MODE ? "mock" : "live"],
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error("No wallet address provided");
      }

      logMockActivity("Fetching balance", { walletAddress });
      const result = await getUsdcBalance(walletAddress);
      logMockActivity("Balance fetched", { balance: result });
      
      return result;
    },
    enabled: enabled && !!walletAddress,
    refetchInterval,
    staleTime: MOCK_MODE ? Infinity : 30000, // Mock data never stales
    retry: MOCK_MODE ? false : 3, // No retries needed in mock mode
  });

  // Format balance for display (convert from smallest unit to readable)
  const formattedBalance = balance !== undefined 
    ? (balance / 1_000_000).toFixed(2)
    : "0.00";

  const handleRefetch = () => {
    refetch();
    // In mock mode, also invalidate to force re-fetch
    if (MOCK_MODE) {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    }
  };

  return {
    balance,
    formattedBalance,
    isLoading,
    isError,
    error: error as Error | null,
    refetch: handleRefetch,
  };
}

/**
 * Hook to invalidate balance cache (useful after transactions)
 */
export function useInvalidateBalance() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
  };
}
