// =============================================================================
// QUERY PROVIDER
// =============================================================================
// React Query provider for server state management.
// =============================================================================

"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// =============================================================================
// PROPS
// =============================================================================

interface QueryProviderProps {
  children: ReactNode;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

/**
 * QueryProvider
 * 
 * Provides React Query context for server state management.
 * Configured with sensible defaults for blockchain applications:
 * - Stale time of 30 seconds (data refetches after 30s)
 * - Retry failed queries 3 times
 * - Refetch on window focus
 * 
 * @example
 * ```tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a new QueryClient instance for each session
  // This ensures no stale data is shared between users
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30 seconds
            staleTime: 30 * 1000,
            // Cache data for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed queries 3 times
            retry: 3,
            // Refetch when window regains focus
            refetchOnWindowFocus: true,
            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
