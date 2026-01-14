// =============================================================================
// API CLIENT
// =============================================================================
// Type-safe API client for making requests to the backend.
// =============================================================================

import { getErrorMessage } from "./utils";

// =============================================================================
// TYPES
// =============================================================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
}

// =============================================================================
// API CLIENT CLASS
// =============================================================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body, headers });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body, headers });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body, headers });
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const api = new ApiClient("/api");

// =============================================================================
// TYPE-SAFE API FUNCTIONS
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateUserRequest {
  walletAddress: string;
  credentialId: string;
  publicKey: string;
  platform?: string;
  accountName?: string;
}

export interface User {
  id: string;
  walletAddress: string;
  credentialId: string;
  platform: string | null;
  accountName: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await api.post<{ user: User }>("/users", data);
  return response.user;
}

export async function getUser(walletAddress: string): Promise<User | null> {
  try {
    const response = await api.get<{ user: User }>(`/users/${walletAddress}`);
    return response.user;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Plans
// ─────────────────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceUsdc: number;
  interval: "WEEKLY" | "MONTHLY" | "YEARLY";
  features: string[];
  isActive: boolean;
  badge: string | null;
  isHighlighted: boolean;
}

export async function getPlans(): Promise<Plan[]> {
  const response = await api.get<{ plans: Plan[] }>("/plans");
  return response.plans;
}

export async function getPlan(id: string): Promise<Plan | null> {
  try {
    const response = await api.get<{ plan: Plan }>(`/plans/${id}`);
    return response.plan;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscriptions
// ─────────────────────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "PENDING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
  startDate: string;
  endDate: string | null;
  nextBilling: string;
  plan: Plan;
  createdAt: string;
}

export interface CreateSubscriptionRequest {
  userId: string;
  planId: string;
  paymentSignature: string;
}

export async function createSubscription(
  data: CreateSubscriptionRequest
): Promise<Subscription> {
  const response = await api.post<{ subscription: Subscription }>(
    "/subscriptions",
    data
  );
  return response.subscription;
}

export async function getSubscription(id: string): Promise<Subscription | null> {
  try {
    const response = await api.get<{ subscription: Subscription }>(
      `/subscriptions/${id}`
    );
    return response.subscription;
  } catch {
    return null;
  }
}

export async function getUserSubscriptions(
  walletAddress: string
): Promise<Subscription[]> {
  const response = await api.get<{ subscriptions: Subscription[] }>(
    `/subscriptions/user/${walletAddress}`
  );
  return response.subscriptions;
}

export async function cancelSubscription(
  id: string,
  reason?: string
): Promise<Subscription> {
  const response = await api.post<{ subscription: Subscription }>(
    `/subscriptions/${id}/cancel`,
    { reason }
  );
  return response.subscription;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  userId: string;
  subscriptionId: string | null;
  signature: string;
  amount: number;
  token: string;
  tokenMint: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  type: "SUBSCRIPTION_PAYMENT" | "ONE_TIME_PAYMENT" | "REFUND";
  createdAt: string;
  confirmedAt: string | null;
}

export interface CreateTransactionRequest {
  userId: string;
  subscriptionId?: string;
  signature: string;
  amount: number;
  token: string;
  tokenMint: string;
  recipient: string;
  type: "SUBSCRIPTION_PAYMENT" | "ONE_TIME_PAYMENT" | "REFUND";
}

export async function createTransaction(
  data: CreateTransactionRequest
): Promise<Transaction> {
  const response = await api.post<{ transaction: Transaction }>(
    "/transactions",
    data
  );
  return response.transaction;
}

export async function getTransaction(
  signature: string
): Promise<Transaction | null> {
  try {
    const response = await api.get<{ transaction: Transaction }>(
      `/transactions/${signature}`
    );
    return response.transaction;
  } catch {
    return null;
  }
}

export async function getUserTransactions(
  walletAddress: string,
  options?: { limit?: number; offset?: number }
): Promise<{ transactions: Transaction[]; total: number }> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/transactions/user/${walletAddress}${query}`);
}
