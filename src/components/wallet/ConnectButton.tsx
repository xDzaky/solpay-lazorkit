// =============================================================================
// CONNECT BUTTON COMPONENT
// =============================================================================
// Main button for connecting/disconnecting Lazorkit smart wallet.
// Demonstrates passkey-based authentication flow.
// =============================================================================

"use client";

import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { useBalance } from "@/hooks";
import { createUser } from "@/lib/api";
import { formatAddress, getErrorMessage, isUserCancellation } from "@/lib/utils";
import { MOCK_MODE } from "@/lib/mock-mode";
import { Fingerprint, LogOut, Wallet, Copy, Check, ExternalLink, Coins } from "lucide-react";
import { getExplorerUrl } from "@/lib/constants";

// =============================================================================
// COMPONENT
// =============================================================================

interface ConnectButtonProps {
  /** Size of the button */
  size?: "sm" | "default" | "lg";
  /** Show full wallet address when connected */
  showAddress?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ConnectButton
 * 
 * A button that handles wallet connection via Lazorkit passkeys.
 * 
 * Features:
 * - Connect with Face ID / Touch ID / Windows Hello
 * - Auto-reconnect if session exists
 * - Display connected wallet address
 * - Copy address to clipboard
 * - Link to Solana Explorer
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ConnectButton />
 * 
 * // With size variant
 * <ConnectButton size="lg" showAddress />
 * ```
 */
export function ConnectButton({
  size = "default",
  showAddress = true,
  className,
}: ConnectButtonProps) {
  // ─────────────────────────────────────────────────────────────────────────
  // Hooks
  // ─────────────────────────────────────────────────────────────────────────
  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    smartWalletPubkey,
    wallet,
    error: walletError,
  } = useWallet();

  const { setUser, clearUser } = useUserStore();

  // Get balance
  const { formattedBalance, isLoading: balanceLoading } = useBalance(
    smartWalletPubkey?.toString()
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Local State
  // ─────────────────────────────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Handle wallet connection
   * 1. Connect via Lazorkit (triggers passkey auth)
   * 2. Save user to database
   * 3. Update local store
   */
  const handleConnect = async () => {
    setError(null);

    try {
      // Step 1: Connect wallet via Lazorkit
      // This opens the portal and prompts for passkey authentication
      const walletInfo = await connect();

      // Step 2: Save user to database
      try {
        const user = await createUser({
          walletAddress: walletInfo.smartWallet,
          credentialId: walletInfo.credentialId,
          publicKey: Buffer.from(walletInfo.passkeyPubkey).toString("base64"),
          platform: walletInfo.platform,
          accountName: walletInfo.accountName,
        });

        // Step 3: Update local store
        setUser(user);
      } catch (apiError) {
        // Log but don't fail - user can still use the wallet
        console.error("Failed to save user to database:", apiError);
      }
    } catch (err) {
      // Handle user cancellation gracefully
      if (isUserCancellation(err)) {
        return; // User cancelled, no error to show
      }
      setError(getErrorMessage(err));
    }
  };

  /**
   * Handle wallet disconnection
   */
  const handleDisconnect = async () => {
    try {
      await disconnect();
      clearUser();
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  /**
   * Copy wallet address to clipboard
   */
  const handleCopy = async () => {
    if (!smartWalletPubkey) return;

    try {
      await navigator.clipboard.writeText(smartWalletPubkey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Connected State
  // ─────────────────────────────────────────────────────────────────────────
  if (isConnected && smartWalletPubkey) {
    const address = smartWalletPubkey.toString();

    return (
      <div className="flex items-center gap-2">
        {/* Wallet Info */}
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg border">
          {/* Status Badge */}
          <Badge variant="success" className="text-xs">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
            Connected
          </Badge>

          {/* Balance Display */}
          <div className="flex items-center gap-1 text-sm font-medium">
            <Coins className="w-3.5 h-3.5 text-yellow-500" />
            <span>{balanceLoading ? "..." : `$${formattedBalance}`}</span>
            {MOCK_MODE && <span className="text-[10px] text-muted-foreground">(Mock)</span>}
          </div>

          {/* Address */}
          {showAddress && (
            <span className="font-mono text-sm text-muted-foreground">
              {formatAddress(address, 4, 4)}
            </span>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-secondary rounded transition-colors"
            title="Copy address"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {/* Explorer Link */}
          <a
            href={getExplorerUrl("address", address)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-secondary rounded transition-colors"
            title="View on Solana Explorer"
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        </div>

        {/* Disconnect Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDisconnect}
          title="Disconnect wallet"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Disconnected State
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="solana"
        size={size}
        onClick={handleConnect}
        isLoading={isConnecting}
        className={className}
      >
        {isConnecting ? (
          "Connecting..."
        ) : (
          <>
            <Fingerprint className="w-5 h-5" />
            Connect with Passkey
          </>
        )}
      </Button>

      {/* Error Message */}
      {(error || walletError) && (
        <p className="text-sm text-destructive">
          {error || walletError?.message}
        </p>
      )}
    </div>
  );
}

export default ConnectButton;
