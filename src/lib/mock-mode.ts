// =============================================================================
// MOCK MODE - For Testing Without Real USDC
// =============================================================================
// Enable this mode to test the full application flow without needing
// real USDC tokens. Perfect for development and demo purposes.
// Data persists in localStorage for realistic testing experience.
// =============================================================================

// Check if mock mode is enabled via environment variable
export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Your test wallet address
export const TEST_WALLET_ADDRESS = '3DsES4XP6HwsLgXmGc53DzJEpukfieiBP2tmfQVmB8Vc';

// localStorage keys
const STORAGE_KEYS = {
  BALANCE: 'solpay_mock_balance',
  SOL_BALANCE: 'solpay_mock_sol_balance',
  TRANSACTIONS: 'solpay_mock_transactions',
  SUBSCRIPTION: 'solpay_mock_subscription',
};

// =============================================================================
// MOCK BALANCES (Persisted in localStorage)
// =============================================================================

// Simulated USDC balance (1000 USDC = 1,000,000,000 in smallest unit with 6 decimals)
export const MOCK_USDC_BALANCE = 1000_000_000; // 1000 USDC
// Simulated SOL balance (10 SOL = 10,000,000,000 lamports)
export const MOCK_SOL_BALANCE = 10_000_000_000; // 10 SOL

// Helper to check if we're in browser
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getMockBalance(): number {
  if (!isBrowser()) return MOCK_USDC_BALANCE;
  
  const stored = localStorage.getItem(STORAGE_KEYS.BALANCE);
  if (stored) {
    return parseInt(stored, 10);
  }
  // Initialize with default balance
  localStorage.setItem(STORAGE_KEYS.BALANCE, MOCK_USDC_BALANCE.toString());
  return MOCK_USDC_BALANCE;
}

export function getMockSolBalance(): number {
  if (!isBrowser()) return MOCK_SOL_BALANCE;
  
  const stored = localStorage.getItem(STORAGE_KEYS.SOL_BALANCE);
  if (stored) {
    return parseInt(stored, 10);
  }
  // Initialize with default balance
  localStorage.setItem(STORAGE_KEYS.SOL_BALANCE, MOCK_SOL_BALANCE.toString());
  return MOCK_SOL_BALANCE;
}

export function deductMockBalance(amount: number): void {
  if (!isBrowser()) return;
  
  const currentBalance = getMockBalance();
  const newBalance = currentBalance - amount;
  localStorage.setItem(STORAGE_KEYS.BALANCE, newBalance.toString());
}

export function deductMockSolBalance(amount: number): void {
  if (!isBrowser()) return;
  
  const currentBalance = getMockSolBalance();
  const newBalance = currentBalance - amount;
  localStorage.setItem(STORAGE_KEYS.SOL_BALANCE, newBalance.toString());
}

export function resetMockBalance(): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.BALANCE, MOCK_USDC_BALANCE.toString());
  localStorage.setItem(STORAGE_KEYS.SOL_BALANCE, MOCK_SOL_BALANCE.toString());
}

// =============================================================================
// MOCK TRANSACTIONS (Persisted in localStorage)
// =============================================================================

export interface MockTransaction {
  id: string;
  signature: string;
  from?: string;
  fromAddress?: string;
  to?: string;
  toAddress?: string;
  amount: number;
  token: string;
  status: 'confirmed' | 'pending' | 'failed' | 'SUCCESS' | 'PENDING' | 'FAILED';
  timestamp?: number;
  createdAt: Date;
  planId?: string;
  planName?: string;
  description?: string;
  type: 'SUBSCRIPTION_PAYMENT' | 'TRANSFER' | 'SEND' | 'RECEIVE';
}

export function addMockTransaction(tx: Omit<MockTransaction, 'id' | 'signature' | 'createdAt' | 'status'>): MockTransaction {
  const newTx: MockTransaction = {
    ...tx,
    id: `mock_tx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    signature: generateMockSignature(),
    timestamp: Date.now(),
    createdAt: new Date(),
    status: 'SUCCESS',
  };
  
  if (isBrowser()) {
    const existing = getMockTransactions();
    existing.unshift(newTx); // Add to beginning (newest first)
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(existing));
  }
  
  return newTx;
}

export function getMockTransactions(): MockTransaction[] {
  if (!isBrowser()) return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function clearMockTransactions(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
}

// =============================================================================
// MOCK SUBSCRIPTIONS (Persisted in localStorage)
// =============================================================================

export interface MockSubscription {
  id: string;
  planId: string;
  planName: string;
  priceUsdc: number;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: Date | string;
  endDate: Date | string;
  transactionSignature: string;
}

export function setMockSubscription(sub: MockSubscription): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
}

export function getMockSubscription(): MockSubscription | null {
  if (!isBrowser()) return null;
  
  const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function clearMockSubscription(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
}

// Clear all mock data (useful for testing reset)
export function clearAllMockData(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.BALANCE);
  localStorage.removeItem(STORAGE_KEYS.SOL_BALANCE);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
}

// Alias for convenience
export const clearMockData = clearAllMockData;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Generate a fake Solana transaction signature
 * Real signatures are 88 characters base58
 */
function generateMockSignature(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 88; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Simulate network delay for realistic UX
 */
export function simulateDelay(ms: number = 1500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log mock mode activity
 */
export function logMockActivity(action: string, details?: Record<string, unknown>): void {
  if (MOCK_MODE) {
    console.log(`🧪 [MOCK MODE] ${action}`, details || '');
  }
}

// =============================================================================
// MOCK PLANS DATA (matches database seed)
// =============================================================================

export const MOCK_PLANS = [
  {
    id: 'plan_basic',
    name: 'Basic',
    description: 'Perfect for individuals getting started',
    priceUsdc: 5_000_000, // $5
    interval: 'MONTHLY',
    features: [
      'Up to 10 transactions/month',
      'Basic analytics dashboard',
      'Email support',
      '1 connected wallet',
    ],
    badge: null,
    isHighlighted: false,
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    description: 'For professionals who need more power',
    priceUsdc: 15_000_000, // $15
    interval: 'MONTHLY',
    features: [
      'Unlimited transactions',
      'Advanced analytics & reports',
      'Priority support',
      '5 connected wallets',
      'API access',
      'Custom webhooks',
    ],
    badge: 'Most Popular',
    isHighlighted: true,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    description: 'For teams with advanced needs',
    priceUsdc: 50_000_000, // $50
    interval: 'MONTHLY',
    features: [
      'Everything in Pro',
      'Unlimited connected wallets',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-chain analytics',
    ],
    badge: 'Best for Teams',
    isHighlighted: false,
  },
];
