// =============================================================================
// USER STORE
// =============================================================================
// Zustand store for managing user state.
// =============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

// =============================================================================
// TYPES
// =============================================================================

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

interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// =============================================================================
// STORE
// =============================================================================

/**
 * User Store
 * 
 * Manages user state with persistence to localStorage.
 * 
 * @example
 * ```tsx
 * const { user, setUser, clearUser } = useUserStore();
 * 
 * // Set user after connection
 * setUser(userData);
 * 
 * // Clear user on disconnect
 * clearUser();
 * ```
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, error: null }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      clearUser: () => set({ user: null, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: "solpay-user-store",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Select if user is authenticated
 */
export const selectIsAuthenticated = (state: UserState) => state.user !== null;

/**
 * Select user's wallet address
 */
export const selectWalletAddress = (state: UserState) =>
  state.user?.walletAddress ?? null;

/**
 * Select user's display name (accountName or truncated address)
 */
export const selectDisplayName = (state: UserState) => {
  if (!state.user) return null;
  if (state.user.accountName) return state.user.accountName;
  const addr = state.user.walletAddress;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
};

export default useUserStore;
