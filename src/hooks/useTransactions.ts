"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import type { Transaction, PaginatedResponse } from "@/types";

/**
 * Hook for fetching user's transaction history
 */
export function useTransactions(limit: number = 10) {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (newOffset: number = 0) => {
      if (!smartWalletPubkey) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/transactions/user/${smartWalletPubkey.toString()}?limit=${limit}&offset=${newOffset}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data: PaginatedResponse<Transaction> = await response.json();

        if (newOffset === 0) {
          setTransactions(data.data);
        } else {
          setTransactions((prev) => [...prev, ...data.data]);
        }

        setTotal(data.total);
        setOffset(newOffset);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [smartWalletPubkey, limit]
  );

  // Fetch on mount and when wallet connects
  useEffect(() => {
    if (isConnected && smartWalletPubkey) {
      fetchTransactions(0);
    } else {
      setTransactions([]);
      setTotal(0);
      setOffset(0);
    }
  }, [isConnected, smartWalletPubkey, fetchTransactions]);

  const loadMore = useCallback(() => {
    const newOffset = offset + limit;
    if (newOffset < total) {
      fetchTransactions(newOffset);
    }
  }, [offset, limit, total, fetchTransactions]);

  const refresh = useCallback(() => {
    fetchTransactions(0);
  }, [fetchTransactions]);

  return {
    transactions,
    total,
    isLoading,
    error,
    hasMore: offset + transactions.length < total,
    loadMore,
    refresh,
  };
}
