// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
// Common utility functions used throughout the application.
// =============================================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TOKENS } from "./constants";

// =============================================================================
// CLASSNAME UTILITIES
// =============================================================================

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conditional classes and deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================================
// ADDRESS FORMATTING
// =============================================================================

/**
 * Truncate a Solana address for display
 * @example formatAddress("7BeWr6tVa1pYgrEddekYTnQENU22bBw9H8HYJUkbrN71") => "7BeW...rN71"
 */
export function formatAddress(
  address: string,
  startChars: number = 4,
  endChars: number = 4
): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format a transaction signature for display
 */
export function formatSignature(signature: string): string {
  return formatAddress(signature, 8, 8);
}

// =============================================================================
// TOKEN & CURRENCY FORMATTING
// =============================================================================

/**
 * Truncate a Solana address for display (alias for formatAddress)
 */
export function truncateAddress(
  address: string,
  startChars: number = 4,
  endChars: number = 4
): string {
  return formatAddress(address, startChars, endChars);
}

/**
 * Format USDC amount from smallest unit to display string
 * Database stores USDC in smallest unit (6 decimals): 5_000_000 = $5.00
 * 
 * @param amount - Amount in smallest unit (6 decimals for USDC)
 * @returns Formatted string (e.g., "$5.00")
 */
export function formatUsdc(amount: number): string {
  const value = amount / Math.pow(10, TOKENS.USDC.decimals);
  return `$${value.toFixed(2)}`;
}

/**
 * Format raw USDC amount (human-readable) to display string
 * @param amount - Human-readable amount (e.g., 9.99)
 * @returns Formatted string (e.g., "$9.99")
 */
export function formatUsdcRaw(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Format SOL amount from lamports to display string
 * @param lamports - Amount in lamports (9 decimals)
 * @returns Formatted string (e.g., "0.5 SOL")
 */
export function formatSol(lamports: number): string {
  const value = lamports / Math.pow(10, TOKENS.SOL.decimals);
  return `${value.toFixed(4)} SOL`;
}

/**
 * Parse USDC from human-readable to smallest unit
 * @param amount - Human-readable amount (e.g., 5 for $5)
 * @returns Amount in smallest unit
 */
export function parseUsdc(amount: number): number {
  return Math.floor(amount * Math.pow(10, TOKENS.USDC.decimals));
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// =============================================================================
// DATE & TIME FORMATTING
// =============================================================================

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Check if a string is a valid Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

/**
 * Check if a string is a valid transaction signature
 */
export function isValidTransactionSignature(signature: string): boolean {
  // Transaction signatures are 88 characters base58
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
  return base58Regex.test(signature);
}

// =============================================================================
// ASYNC UTILITIES
// =============================================================================

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, initialDelay = 1000, maxDelay = 10000 } = options;

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;

      await sleep(delay);
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  throw lastError;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

/**
 * Check if error is a user cancellation
 */
export function isUserCancellation(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("user rejected") ||
    message.includes("user cancelled") ||
    message.includes("user denied")
  );
}

// =============================================================================
// STORAGE UTILITIES
// =============================================================================

/**
 * Safely get item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`Failed to save to localStorage: ${key}`);
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`Failed to remove from localStorage: ${key}`);
  }
}

// =============================================================================
// COPY TO CLIPBOARD
// =============================================================================

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
