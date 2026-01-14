// =============================================================================
// SUBSCRIPTION STORE
// =============================================================================
// Zustand store for managing subscription state.
// =============================================================================

import { create } from "zustand";

// =============================================================================
// TYPES
// =============================================================================

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

interface SubscriptionState {
  // State
  currentSubscription: Subscription | null;
  availablePlans: Plan[];
  selectedPlanId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSubscription: (subscription: Subscription | null) => void;
  setPlans: (plans: Plan[]) => void;
  selectPlan: (planId: string | null) => void;
  clearSubscription: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// =============================================================================
// STORE
// =============================================================================

/**
 * Subscription Store
 * 
 * Manages subscription and plan state.
 * 
 * @example
 * ```tsx
 * const { 
 *   currentSubscription, 
 *   availablePlans, 
 *   selectPlan 
 * } = useSubscriptionStore();
 * ```
 */
export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  // Initial state
  currentSubscription: null,
  availablePlans: [],
  selectedPlanId: null,
  isLoading: false,
  error: null,

  // Actions
  setSubscription: (subscription) =>
    set({ currentSubscription: subscription, error: null }),

  setPlans: (plans) => set({ availablePlans: plans }),

  selectPlan: (planId) => set({ selectedPlanId: planId }),

  clearSubscription: () =>
    set({ currentSubscription: null, selectedPlanId: null, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Select if user has an active subscription
 */
export const selectHasActiveSubscription = (state: SubscriptionState) =>
  state.currentSubscription?.status === "ACTIVE";

/**
 * Select the currently selected plan
 */
export const selectSelectedPlan = (state: SubscriptionState) =>
  state.availablePlans.find((p) => p.id === state.selectedPlanId) ?? null;

/**
 * Select the highlighted plan (most popular)
 */
export const selectHighlightedPlan = (state: SubscriptionState) =>
  state.availablePlans.find((p) => p.isHighlighted) ?? null;

export default useSubscriptionStore;
