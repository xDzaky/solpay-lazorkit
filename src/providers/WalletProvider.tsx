// =============================================================================
// WALLET PROVIDER
// =============================================================================
// Wrapper around LazorkitProvider with additional configuration and
// integration with the application's user management.
// =============================================================================

"use client";

import { ReactNode } from "react";
import { LazorkitProvider } from "@lazorkit/wallet";
import { RPC_URL, LAZORKIT_CONFIG } from "@/lib/constants";

// =============================================================================
// PROPS
// =============================================================================

interface WalletProviderProps {
  children: ReactNode;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

/**
 * WalletProvider
 * 
 * Wraps the application with LazorkitProvider for passkey-based authentication.
 * This provider handles:
 * - Passkey authentication via WebAuthn
 * - Session persistence (auto-reconnect)
 * - Gasless transactions via Paymaster
 * 
 * @example
 * ```tsx
 * // In your root layout
 * <WalletProvider>
 *   <App />
 * </WalletProvider>
 * ```
 */
export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <LazorkitProvider
      rpcUrl={RPC_URL}
      portalUrl={LAZORKIT_CONFIG.portalUrl}
      paymasterConfig={{
        paymasterUrl: LAZORKIT_CONFIG.paymasterUrl,
        ...(LAZORKIT_CONFIG.apiKey && { apiKey: LAZORKIT_CONFIG.apiKey }),
      }}
    >
      {children}
    </LazorkitProvider>
  );
}

export default WalletProvider;
