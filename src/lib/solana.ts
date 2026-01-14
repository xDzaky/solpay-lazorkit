// =============================================================================
// SOLANA UTILITIES
// =============================================================================
// Helper functions for Solana interactions, including token transfers
// and transaction building using Lazorkit smart wallets.
// =============================================================================

import {
  Connection,
  PublicKey,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { RPC_URL, TOKENS, VAULT_ADDRESS } from "./constants";
import { MOCK_MODE, getMockBalance, logMockActivity } from "./mock-mode";

// =============================================================================
// CONNECTION
// =============================================================================

/**
 * Get Solana connection instance
 */
export function getConnection(): Connection {
  return new Connection(RPC_URL, "confirmed");
}

// =============================================================================
// TOKEN ACCOUNT UTILITIES
// =============================================================================

/**
 * Get or create associated token account address
 */
export async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  payer: PublicKey
): Promise<{
  address: PublicKey;
  instruction: TransactionInstruction | null;
}> {
  const associatedTokenAddress = await getAssociatedTokenAddress(
    mint,
    owner,
    true // allowOwnerOffCurve - required for PDAs like smart wallets
  );

  try {
    // Check if account exists
    await getAccount(connection, associatedTokenAddress);
    return { address: associatedTokenAddress, instruction: null };
  } catch {
    // Account doesn't exist, create instruction to initialize it
    const instruction = createAssociatedTokenAccountInstruction(
      payer,
      associatedTokenAddress,
      owner,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return { address: associatedTokenAddress, instruction };
  }
}

// =============================================================================
// BALANCE QUERIES
// =============================================================================

/**
 * Get USDC balance for a wallet
 * @returns Balance in USDC's smallest unit (6 decimals)
 */
export async function getUsdcBalance(walletAddress: string): Promise<number> {
  // In mock mode, return simulated balance
  if (MOCK_MODE) {
    const balance = getMockBalance();
    logMockActivity('Getting USDC balance', { walletAddress, balance });
    return balance;
  }

  const connection = getConnection();
  const wallet = new PublicKey(walletAddress);
  const mint = new PublicKey(TOKENS.USDC.mint);

  try {
    const tokenAccount = await getAssociatedTokenAddress(mint, wallet, true);
    const account = await getAccount(connection, tokenAccount);
    return Number(account.amount);
  } catch {
    // Token account doesn't exist, balance is 0
    return 0;
  }
}

/**
 * Get SOL balance for a wallet
 * @returns Balance in lamports
 */
export async function getSolBalance(walletAddress: string): Promise<number> {
  const connection = getConnection();
  const wallet = new PublicKey(walletAddress);
  return connection.getBalance(wallet);
}

// =============================================================================
// TRANSFER INSTRUCTIONS
// =============================================================================

/**
 * Build USDC transfer instruction
 * 
 * @param fromWallet - Sender's smart wallet address (PDA)
 * @param toWallet - Recipient's wallet address
 * @param amount - Amount in USDC's smallest unit (6 decimals)
 * @returns TransactionInstruction for the transfer
 * 
 * @example
 * // Transfer 5 USDC
 * const instruction = await buildUsdcTransferInstruction(
 *   "sender_address",
 *   "recipient_address", 
 *   5_000_000 // 5 USDC = 5 * 10^6
 * );
 */
export async function buildUsdcTransferInstruction(
  fromWallet: string,
  toWallet: string,
  amount: number
): Promise<TransactionInstruction[]> {
  const connection = getConnection();
  const from = new PublicKey(fromWallet);
  const to = new PublicKey(toWallet);
  const mint = new PublicKey(TOKENS.USDC.mint);

  const instructions: TransactionInstruction[] = [];

  // Get sender's token account
  const fromTokenAccount = await getAssociatedTokenAddress(mint, from, true);

  // Get or create recipient's token account
  const { address: toTokenAccount, instruction: createAtaInstruction } =
    await getOrCreateAssociatedTokenAccount(connection, mint, to, from);

  // Add create ATA instruction if needed
  if (createAtaInstruction) {
    instructions.push(createAtaInstruction);
  }

  // Add transfer instruction
  instructions.push(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      from,
      amount
    )
  );

  return instructions;
}

/**
 * Build subscription payment instruction
 * Transfers USDC from user's smart wallet to the vault
 */
export async function buildSubscriptionPaymentInstruction(
  fromWallet: string,
  amountUsdc: number
): Promise<TransactionInstruction[]> {
  if (!VAULT_ADDRESS) {
    throw new Error("VAULT_ADDRESS is not configured");
  }

  return buildUsdcTransferInstruction(fromWallet, VAULT_ADDRESS, amountUsdc);
}

/**
 * Build SOL transfer instruction
 */
export function buildSolTransferInstruction(
  fromWallet: string,
  toWallet: string,
  lamports: number
): TransactionInstruction {
  return SystemProgram.transfer({
    fromPubkey: new PublicKey(fromWallet),
    toPubkey: new PublicKey(toWallet),
    lamports,
  });
}

// =============================================================================
// TRANSACTION VERIFICATION
// =============================================================================

/**
 * Verify a transaction was confirmed on-chain
 */
export async function verifyTransaction(
  signature: string,
  maxRetries: number = 10,
  retryDelay: number = 2000
): Promise<{
  confirmed: boolean;
  slot?: number;
  error?: string;
}> {
  const connection = getConnection();

  for (let i = 0; i < maxRetries; i++) {
    try {
      const status = await connection.getSignatureStatus(signature);

      if (status.value) {
        if (status.value.err) {
          return {
            confirmed: false,
            error: JSON.stringify(status.value.err),
          };
        }

        if (
          status.value.confirmationStatus === "confirmed" ||
          status.value.confirmationStatus === "finalized"
        ) {
          return {
            confirmed: true,
            slot: status.value.slot,
          };
        }
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    } catch (error) {
      console.error("Error checking transaction status:", error);
    }
  }

  return {
    confirmed: false,
    error: "Transaction confirmation timeout",
  };
}

/**
 * Get transaction details
 */
export async function getTransactionDetails(signature: string) {
  const connection = getConnection();
  return connection.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert USDC amount to human-readable format
 */
export function usdcToHuman(amount: number): number {
  return amount / Math.pow(10, TOKENS.USDC.decimals);
}

/**
 * Convert human-readable USDC to smallest unit
 */
export function humanToUsdc(amount: number): number {
  return Math.floor(amount * Math.pow(10, TOKENS.USDC.decimals));
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}
