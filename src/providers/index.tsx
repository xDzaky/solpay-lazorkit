// =============================================================================
// PROVIDERS INDEX
// =============================================================================
// Combined providers wrapper for the application.
// =============================================================================

"use client";

import { ReactNode } from "react";
import { WalletProvider } from "./WalletProvider";
import { QueryProvider } from "./QueryProvider";

// =============================================================================
// PROPS
// =============================================================================

interface ProvidersProps {
  children: ReactNode;
}

// =============================================================================
// COMBINED PROVIDERS
// =============================================================================

/**
 * Providers
 * 
 * Combines all application providers in the correct order.
 * 
 * Provider Order (outside to inside):
 * 1. QueryProvider - Server state management
 * 2. WalletProvider - Lazorkit wallet context
 * 
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <Providers>
 *   {children}
 * </Providers>
 * ```
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </QueryProvider>
  );
}

export { WalletProvider } from "./WalletProvider";
export { QueryProvider } from "./QueryProvider";
export default Providers;
