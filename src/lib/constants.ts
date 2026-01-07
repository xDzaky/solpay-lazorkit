// =============================================================================
// CONSTANTS - Application Configuration
// =============================================================================
// Centralized configuration for the SolPay application.
// All environment variables and magic values should be defined here.
// =============================================================================

import { PublicKey } from "@solana/web3.js";

// =============================================================================
// NETWORK CONFIGURATION
// =============================================================================

export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

// =============================================================================
// LAZORKIT CONFIGURATION
// =============================================================================

export const LAZORKIT_CONFIG = {
  // Portal URL for passkey authentication
  portalUrl:
    process.env.NEXT_PUBLIC_LAZORKIT_PORTAL_URL || "https://portal.lazor.sh",

  // Paymaster URL for gasless transactions
  paymasterUrl:
    process.env.NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL ||
    "https://kora.devnet.lazorkit.com",

  // Optional API key for paymaster
  apiKey: process.env.NEXT_PUBLIC_LAZORKIT_API_KEY,
} as const;

// =============================================================================
// TOKEN CONFIGURATION
// =============================================================================

export const TOKENS = {
  USDC: {
    // Devnet USDC mint address
    // Mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    mint:
      process.env.NEXT_PUBLIC_USDC_MINT ||
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    decimals: 6,
    symbol: "USDC",
    name: "USD Coin",
    logo: "/tokens/usdc.svg",
  },
  SOL: {
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    symbol: "SOL",
    name: "Solana",
    logo: "/tokens/sol.svg",
  },
} as const;

// =============================================================================
// VAULT CONFIGURATION
// =============================================================================

// Wallet address that receives subscription payments
export const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "";

// =============================================================================
// APPLICATION CONFIGURATION
// =============================================================================

export const APP_CONFIG = {
  name: "SolPay",
  description: "Subscription payments powered by Lazorkit passkey smart wallets",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Feature flags
  features: {
    enableMainnet: false,
    debugMode: process.env.NODE_ENV === "development",
    enableAnalytics: process.env.NEXT_PUBLIC_POSTHOG_KEY !== undefined,
  },

  // Billing settings
  billing: {
    gracePeriodDays: 3, // Days after failed payment before cancellation
    maxRetryAttempts: 3, // Maximum payment retry attempts
  },

  // UI settings
  ui: {
    toastDuration: 5000, // Toast notification duration in ms
    transactionPollingInterval: 2000, // How often to poll for tx confirmation
    maxTransactionsPerPage: 10,
  },
} as const;

// =============================================================================
// EXPLORER URLS
// =============================================================================

export const EXPLORER_URLS = {
  devnet: {
    tx: (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
    address: (addr: string) =>
      `https://explorer.solana.com/address/${addr}?cluster=devnet`,
  },
  mainnet: {
    tx: (sig: string) => `https://explorer.solana.com/tx/${sig}`,
    address: (addr: string) => `https://explorer.solana.com/address/${addr}`,
  },
} as const;

// Helper to get explorer URL based on current network
export function getExplorerUrl(type: "tx" | "address", value: string): string {
  const network = SOLANA_NETWORK === "mainnet-beta" ? "mainnet" : "devnet";
  return EXPLORER_URLS[network][type](value);
}

// =============================================================================
// SUBSCRIPTION PLANS (for reference, actual data in database)
// =============================================================================

export const PLAN_INTERVALS = {
  WEEKLY: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  MONTHLY: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  YEARLY: 365 * 24 * 60 * 60 * 1000, // 365 days in ms
} as const;

// =============================================================================
// ERROR CODES
// =============================================================================

export const ERROR_CODES = {
  // Authentication errors
  AUTH_FAILED: "AUTH_FAILED",
  AUTH_CANCELLED: "AUTH_CANCELLED",
  WALLET_NOT_CONNECTED: "WALLET_NOT_CONNECTED",

  // Transaction errors
  TX_FAILED: "TX_FAILED",
  TX_TIMEOUT: "TX_TIMEOUT",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",

  // Subscription errors
  SUBSCRIPTION_NOT_FOUND: "SUBSCRIPTION_NOT_FOUND",
  SUBSCRIPTION_ALREADY_EXISTS: "SUBSCRIPTION_ALREADY_EXISTS",
  PLAN_NOT_FOUND: "PLAN_NOT_FOUND",

  // API errors
  INVALID_REQUEST: "INVALID_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  SERVER_ERROR: "SERVER_ERROR",
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type SolanaNetwork = "devnet" | "mainnet-beta";
export type TokenSymbol = keyof typeof TOKENS;
export type ErrorCode = keyof typeof ERROR_CODES;
