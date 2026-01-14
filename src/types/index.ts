// Types for SolPay application

// ─────────────────────────────────────────────────────────────────────────────
// Database Models (matching Prisma schema)
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  walletAddress: string;
  credentialId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceUSDC: number;
  interval: PlanInterval;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  plan?: Plan;
}

export interface Transaction {
  id: string;
  userId: string;
  subscriptionId?: string | null;
  type: TransactionType;
  status: TransactionStatus;
  amountUSDC: number;
  signature: string;
  createdAt: Date;
  user?: User;
  subscription?: Subscription;
}

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export type PlanInterval = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "PENDING";
export type TransactionType = "SUBSCRIPTION" | "RENEWAL" | "REFUND";
export type TransactionStatus = "PENDING" | "CONFIRMED" | "FAILED";

// ─────────────────────────────────────────────────────────────────────────────
// API Request/Response Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateUserRequest {
  walletAddress: string;
  credentialId: string;
}

export interface CreateSubscriptionRequest {
  walletAddress: string;
  planId: string;
  transactionSignature: string;
  amountPaid: number;
}

export interface CreateTransactionRequest {
  walletAddress: string;
  subscriptionId?: string;
  type: TransactionType;
  amountUSDC: number;
  signature: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Wallet Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WalletInfo {
  smartWallet: string;
  credentialId: string;
  passkeyPubkey: number[];
  platform: string;
  accountName?: string;
}

export interface TransferResult {
  success: boolean;
  signature?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Props
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanCardProps {
  plan: Plan;
  onSubscribe: (planId: string) => void;
  isLoading?: boolean;
  isCurrentPlan?: boolean;
}

export interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  emptyMessage?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UserStoreState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export interface SubscriptionStoreState {
  subscriptions: Subscription[];
  activeSubscription: Subscription | null;
  isLoading: boolean;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setActiveSubscription: (subscription: Subscription | null) => void;
  setLoading: (loading: boolean) => void;
  addSubscription: (subscription: Subscription) => void;
}
