// =============================================================================
// SPL MEMO PROTOCOL UTILITIES
// =============================================================================
// Functions for creating memo instructions that attach metadata to transactions.
// Memos are stored on-chain and searchable via Solana Explorer.
// This adds transparency and traceability to all SolPay transactions.
// =============================================================================

import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { createMemoInstruction } from "@solana/spl-memo";

/**
 * SPL Memo Program ID
 * Standard program for attaching text memos to Solana transactions
 */
export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

/**
 * Transaction types for memo categorization
 */
export type MemoTransactionType =
  | "SUBSCRIPTION"
  | "TRANSFER"
  | "SPLIT_BILL"
  | "REQUEST"
  | "FAUCET";

/**
 * Memo metadata structure
 */
export interface MemoMetadata {
  app: string;
  type: MemoTransactionType;
  service?: string;
  plan?: string;
  amount?: number;
  currency?: string;
  recipient?: string;
  splitCount?: number;
  timestamp: number;
}

/**
 * Create a formatted memo string for SolPay transactions
 * Format: "SolPay: [Type] - [Details] | [Amount] [Currency]"
 * 
 * @example
 * createSolPayMemo("SUBSCRIPTION", { service: "Netflix", plan: "Premium" })
 * // Returns: "SolPay: Netflix - Premium Plan | Subscription Payment"
 */
export function createSolPayMemo(
  type: MemoTransactionType,
  options: {
    service?: string;
    plan?: string;
    amount?: number;
    currency?: string;
    recipient?: string;
    splitCount?: number;
  } = {}
): string {
  const { service, plan, amount, currency, recipient, splitCount } = options;

  let memo = "SolPay:";

  switch (type) {
    case "SUBSCRIPTION":
      memo += ` ${service || "Service"} - ${plan || "Plan"} | Subscription`;
      break;
    case "TRANSFER":
      memo += ` Transfer`;
      if (recipient) memo += ` to ${recipient.slice(0, 8)}...`;
      break;
    case "SPLIT_BILL":
      memo += ` Split Bill`;
      if (splitCount) memo += ` (${splitCount} people)`;
      break;
    case "REQUEST":
      memo += ` Payment Request`;
      break;
    case "FAUCET":
      memo += ` Faucet Airdrop`;
      break;
  }

  if (amount && currency) {
    memo += ` | ${amount} ${currency}`;
  }

  return memo;
}

/**
 * Create a memo instruction for a subscription payment
 * 
 * @param serviceName - Name of the service (e.g., "Netflix", "Spotify")
 * @param planName - Name of the subscription plan
 * @param signerPubkey - The public key of the transaction signer
 * @returns TransactionInstruction for the memo
 * 
 * @example
 * const memoIx = createSubscriptionMemoInstruction(
 *   "Netflix",
 *   "Premium",
 *   userWallet
 * );
 * transaction.add(memoIx);
 */
export function createSubscriptionMemoInstruction(
  serviceName: string,
  planName: string,
  signerPubkey: PublicKey
): TransactionInstruction {
  const memo = createSolPayMemo("SUBSCRIPTION", {
    service: serviceName,
    plan: planName,
  });

  return createMemoInstruction(memo, [signerPubkey]);
}

/**
 * Create a memo instruction for a transfer
 * 
 * @param amount - Transfer amount
 * @param currency - Currency symbol (e.g., "USDC", "SOL")
 * @param recipientAddress - Recipient's wallet address
 * @param signerPubkey - The public key of the transaction signer
 * @returns TransactionInstruction for the memo
 */
export function createTransferMemoInstruction(
  amount: number,
  currency: string,
  recipientAddress: string,
  signerPubkey: PublicKey
): TransactionInstruction {
  const memo = createSolPayMemo("TRANSFER", {
    amount,
    currency,
    recipient: recipientAddress,
  });

  return createMemoInstruction(memo, [signerPubkey]);
}

/**
 * Create a memo instruction for split bill
 * 
 * @param totalAmount - Total bill amount
 * @param currency - Currency symbol
 * @param splitCount - Number of people splitting
 * @param signerPubkey - The public key of the transaction signer
 * @returns TransactionInstruction for the memo
 */
export function createSplitBillMemoInstruction(
  totalAmount: number,
  currency: string,
  splitCount: number,
  signerPubkey: PublicKey
): TransactionInstruction {
  const memo = createSolPayMemo("SPLIT_BILL", {
    amount: totalAmount,
    currency,
    splitCount,
  });

  return createMemoInstruction(memo, [signerPubkey]);
}

/**
 * Create a generic memo instruction with custom text
 * 
 * @param memoText - Custom memo text (max 566 bytes)
 * @param signerPubkey - The public key of the transaction signer
 * @returns TransactionInstruction for the memo
 */
export function createCustomMemoInstruction(
  memoText: string,
  signerPubkey: PublicKey
): TransactionInstruction {
  // Memo has a max size of 566 bytes
  const truncatedMemo = memoText.slice(0, 500);
  return createMemoInstruction(truncatedMemo, [signerPubkey]);
}

/**
 * Parse a SolPay memo string back into structured data
 * 
 * @param memoText - The memo text from a transaction
 * @returns Parsed memo data or null if not a SolPay memo
 */
export function parseSolPayMemo(memoText: string): {
  type: string;
  service?: string;
  plan?: string;
  amount?: number;
  currency?: string;
} | null {
  if (!memoText.startsWith("SolPay:")) {
    return null;
  }

  const parts = memoText.replace("SolPay:", "").trim().split("|");
  const mainPart = parts[0].trim();
  const amountPart = parts[1]?.trim();

  let result: {
    type: string;
    service?: string;
    plan?: string;
    amount?: number;
    currency?: string;
  } = { type: "UNKNOWN" };

  // Parse main part
  if (mainPart.includes("Subscription")) {
    result.type = "SUBSCRIPTION";
    const servicePlan = mainPart.replace("Subscription", "").trim();
    const [service, plan] = servicePlan.split("-").map((s) => s.trim());
    result.service = service;
    result.plan = plan;
  } else if (mainPart.includes("Transfer")) {
    result.type = "TRANSFER";
  } else if (mainPart.includes("Split Bill")) {
    result.type = "SPLIT_BILL";
  }

  // Parse amount part
  if (amountPart) {
    const amountMatch = amountPart.match(/(\d+(?:\.\d+)?)\s*(\w+)/);
    if (amountMatch) {
      result.amount = parseFloat(amountMatch[1]);
      result.currency = amountMatch[2];
    }
  }

  return result;
}
