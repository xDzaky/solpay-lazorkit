# Tutorial 4: Session Persistence & State Management

Learn how to persist user sessions across page reloads and manage application state effectively with Lazorkit SDK.

## Overview

In this tutorial, you'll learn:
- How Lazorkit handles session persistence
- Managing user state with Zustand
- Syncing wallet state with backend
- Implementing auto-reconnect functionality

## Prerequisites

- Completed [Tutorial 1: Passkey Wallet Setup](./01-passkey-wallet-setup.md)
- Completed [Tutorial 2: Gasless Transactions](./02-gasless-transactions.md)
- Completed [Tutorial 3: Subscription System](./03-subscription-system.md)

## Understanding Session Persistence

Lazorkit automatically handles session persistence through:

1. **Passkey credentials** stored in the browser/device
2. **Session data** stored in localStorage
3. **WebAuthn API** for secure credential access

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SESSION PERSISTENCE FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐       │
│   │   Page Load  │──────▶│ Check Local  │──────▶│  Auto        │       │
│   │              │       │   Storage    │       │  Reconnect   │       │
│   └──────────────┘       └──────────────┘       └──────────────┘       │
│                                │                       │               │
│                                ▼                       ▼               │
│                     ┌──────────────────┐    ┌──────────────────┐      │
│                     │  Session Found?  │    │  Wallet Ready!   │      │
│                     │    Yes / No      │    │  isConnected=true│      │
│                     └──────────────────┘    └──────────────────┘      │
│                                │                                       │
│                          No    │                                       │
│                                ▼                                       │
│                     ┌──────────────────┐                              │
│                     │  Show Connect    │                              │
│                     │  Button          │                              │
│                     └──────────────────┘                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Step 1: Understanding Lazorkit's Built-in Persistence

Lazorkit's `LazorkitProvider` automatically handles session persistence. When configured correctly, it will:

```tsx
// src/providers/WalletProvider.tsx

"use client";

import { ReactNode } from "react";
import { LazorkitProvider } from "@lazorkit/wallet";

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <LazorkitProvider
      config={{
        // Solana RPC endpoint
        rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
        
        // Lazorkit portal for passkey management
        portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.lazorkit.com",
        
        // Paymaster configuration for gasless transactions
        paymasterConfig: {
          endpoint: process.env.NEXT_PUBLIC_PAYMASTER_URL || "https://paymaster.lazorkit.com",
        },
      }}
    >
      {children}
    </LazorkitProvider>
  );
}
```

Key features that enable persistence:

1. **Automatic credential storage**: Passkey credentials are stored securely by the browser
2. **Session restoration**: `useWallet()` hook automatically restores the session
3. **Silent re-authentication**: No user interaction needed for returning users

## Step 2: Create a User Store with Zustand

While Lazorkit handles wallet persistence, we need to manage our own application state:

```typescript
// src/store/userStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// =============================================================================
// TYPES
// =============================================================================

export interface User {
  id: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
  
  // Async actions
  fetchOrCreateUser: (walletAddress: string) => Promise<User | null>;
}

// =============================================================================
// STORE
// =============================================================================

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // ─────────────────────────────────────────────────────────────────────
      // Initial State
      // ─────────────────────────────────────────────────────────────────────
      user: null,
      isLoading: false,
      error: null,

      // ─────────────────────────────────────────────────────────────────────
      // Synchronous Actions
      // ─────────────────────────────────────────────────────────────────────
      setUser: (user) => set({ user, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearUser: () => set({ user: null, error: null }),

      // ─────────────────────────────────────────────────────────────────────
      // Async Actions
      // ─────────────────────────────────────────────────────────────────────
      fetchOrCreateUser: async (walletAddress: string) => {
        set({ isLoading: true, error: null });

        try {
          // Try to find existing user
          const findResponse = await fetch(
            `/api/users?walletAddress=${walletAddress}`
          );

          if (findResponse.ok) {
            const existingUser = await findResponse.json();
            if (existingUser) {
              set({ user: existingUser, isLoading: false });
              return existingUser;
            }
          }

          // Create new user if not found
          const createResponse = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress }),
          });

          if (!createResponse.ok) {
            throw new Error("Failed to create user");
          }

          const newUser = await createResponse.json();
          set({ user: newUser, isLoading: false });
          return newUser;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          set({ error: message, isLoading: false });
          return null;
        }
      },
    }),
    {
      name: "solpay-user-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist specific fields
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
```

## Step 3: Sync Wallet Connection with User State

Create a hook that syncs Lazorkit wallet state with your user store:

```typescript
// src/hooks/useWalletSync.ts

"use client";

import { useEffect, useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import { useUserStore } from "@/store/userStore";

/**
 * Hook to synchronize wallet connection state with user store
 * 
 * This hook:
 * 1. Monitors wallet connection status
 * 2. Fetches/creates user when wallet connects
 * 3. Clears user when wallet disconnects
 */
export function useWalletSync() {
  const { isConnected, smartWalletPubkey, isReady } = useWallet();
  const { user, fetchOrCreateUser, clearUser, setLoading } = useUserStore();

  // Handle wallet connection
  const handleConnect = useCallback(async () => {
    if (!smartWalletPubkey) return;
    
    const walletAddress = smartWalletPubkey.toString();
    
    // Skip if already synced
    if (user?.walletAddress === walletAddress) return;
    
    await fetchOrCreateUser(walletAddress);
  }, [smartWalletPubkey, user, fetchOrCreateUser]);

  // Handle wallet disconnection
  const handleDisconnect = useCallback(() => {
    clearUser();
  }, [clearUser]);

  // Watch connection state
  useEffect(() => {
    if (!isReady) {
      setLoading(true);
      return;
    }

    setLoading(false);

    if (isConnected && smartWalletPubkey) {
      handleConnect();
    } else if (!isConnected) {
      handleDisconnect();
    }
  }, [isReady, isConnected, smartWalletPubkey, handleConnect, handleDisconnect, setLoading]);

  return {
    isReady,
    isConnected,
    user,
    walletAddress: smartWalletPubkey?.toString(),
  };
}
```

## Step 4: Create an App Shell Component

Wrap your app with a component that initializes the sync:

```tsx
// src/components/layout/AppShell.tsx

"use client";

import { ReactNode, useEffect, useState } from "react";
import { useWalletSync } from "@/hooks/useWalletSync";
import { Loader2 } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isReady, isConnected, user } = useWalletSync();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state while checking session
  if (!mounted || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-500" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

## Step 5: Protected Routes

Create a wrapper for routes that require authentication:

```tsx
// src/components/auth/RequireAuth.tsx

"use client";

import { ReactNode } from "react";
import { useWallet } from "@lazorkit/wallet";
import { useUserStore } from "@/store/userStore";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { isConnected } = useWallet();
  const { user, isLoading } = useUserStore();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Verifying session...
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isConnected || !user) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-violet-500/10 rounded-full w-fit mb-4">
            <Lock className="h-6 w-6 text-violet-500" />
          </div>
          <CardTitle>Authentication Required</CardTitle>
          <p className="text-muted-foreground">
            Please connect your wallet to access this content
          </p>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ConnectButton />
        </CardContent>
      </Card>
    );
  }

  // Authenticated
  return <>{children}</>;
}
```

## Step 6: Subscription State Store

Extend persistence to subscription state:

```typescript
// src/store/subscriptionStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// =============================================================================
// TYPES
// =============================================================================

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: {
    id: string;
    name: string;
    priceUsdc: number;
    interval: string;
  };
}

interface SubscriptionState {
  // State
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSubscription: (sub: Subscription | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSubscription: () => void;
  
  // Async
  fetchSubscription: (userId: string) => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

// =============================================================================
// STORE
// =============================================================================

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      isLoading: false,
      error: null,

      setSubscription: (subscription) => set({ subscription, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearSubscription: () => set({ subscription: null, error: null }),

      fetchSubscription: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/subscriptions?userId=${userId}`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch subscription");
          }

          const data = await response.json();
          set({ subscription: data, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          set({ error: message, isLoading: false, subscription: null });
        }
      },

      refreshSubscription: async () => {
        const { subscription } = get();
        if (subscription?.userId) {
          await get().fetchSubscription(subscription.userId);
        }
      },
    }),
    {
      name: "solpay-subscription-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        subscription: state.subscription,
      }),
    }
  )
);
```

## Step 7: Hydration Safety

Handle hydration mismatches in Next.js:

```tsx
// src/hooks/useHydration.ts

import { useState, useEffect } from "react";

/**
 * Hook to safely handle hydration in Next.js
 * 
 * Usage:
 * ```tsx
 * const isHydrated = useHydration();
 * 
 * if (!isHydrated) {
 *   return <Skeleton />;
 * }
 * 
 * return <ClientOnlyComponent />;
 * ```
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
```

```tsx
// Usage in components

"use client";

import { useHydration } from "@/hooks/useHydration";
import { useUserStore } from "@/store/userStore";
import { Skeleton } from "@/components/ui/skeleton";

export function UserInfo() {
  const hydrated = useHydration();
  const { user } = useUserStore();

  // Prevent hydration mismatch
  if (!hydrated) {
    return <Skeleton className="h-10 w-32" />;
  }

  if (!user) {
    return <span>Not connected</span>;
  }

  return (
    <span>
      {user.walletAddress.slice(0, 4)}...{user.walletAddress.slice(-4)}
    </span>
  );
}
```

## Step 8: Complete Integration Example

Here's how everything fits together in your main layout:

```tsx
// src/app/layout.tsx

import "@/lib/polyfills";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/providers";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SolPay - Subscription Payments on Solana",
  description: "Gasless subscription payments powered by Lazorkit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
```

## Session Lifecycle Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       COMPLETE SESSION LIFECYCLE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   1. INITIAL LOAD                                                       │
│   ├── LazorkitProvider initializes                                     │
│   ├── Check localStorage for existing session                          │
│   ├── If found → Restore wallet state silently                         │
│   └── Trigger useWalletSync → Sync with user store                     │
│                                                                         │
│   2. NEW USER FLOW                                                      │
│   ├── User clicks "Connect Wallet"                                     │
│   ├── Passkey creation/selection modal                                 │
│   ├── WebAuthn authenticates user                                      │
│   ├── Lazorkit stores session                                          │
│   └── User store syncs → Database record created                       │
│                                                                         │
│   3. RETURNING USER FLOW                                                │
│   ├── Page loads                                                       │
│   ├── Lazorkit auto-restores session                                   │
│   ├── useWalletSync detects connection                                 │
│   ├── User store hydrates from localStorage                            │
│   └── User is immediately authenticated!                                │
│                                                                         │
│   4. DISCONNECT FLOW                                                    │
│   ├── User clicks "Disconnect"                                         │
│   ├── Lazorkit clears session                                          │
│   ├── useWalletSync detects disconnection                              │
│   └── User store clears → UI updates                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Best Practices

### 1. **Don't Double-Store Wallet State**
Let Lazorkit handle wallet state. Only persist your own application data.

### 2. **Use Zustand's `persist` Middleware**
It handles localStorage serialization and hydration safely.

### 3. **Handle Hydration Carefully**
Always check for hydration in client components that read from stores.

### 4. **Sync, Don't Duplicate**
Sync wallet state to your backend, don't try to recreate it.

### 5. **Clear State on Disconnect**
Always clean up user state when the wallet disconnects.

## Testing Session Persistence

1. **Connect wallet** and complete a transaction
2. **Refresh the page** - You should still be connected
3. **Close and reopen the tab** - Session should restore
4. **Clear localStorage** - Connection should be lost
5. **Reconnect** - User data should be restored from database

## Debugging Tips

```typescript
// Check Lazorkit session state
const { isConnected, isReady, smartWalletPubkey } = useWallet();
console.log("Lazorkit state:", { isConnected, isReady, smartWalletPubkey?.toString() });

// Check Zustand state
const userState = useUserStore.getState();
console.log("User store:", userState);

// Check localStorage directly
console.log("localStorage:", localStorage.getItem("solpay-user-storage"));
```

---

**Congratulations!** You now have a complete understanding of session persistence with Lazorkit! 🎉

Your users can now:
- ✅ Connect once and stay connected
- ✅ Return to your app without re-authenticating
- ✅ Have their subscription state persist across sessions
- ✅ Enjoy a seamless, Web2-like experience

## What's Next?

- Implement session expiration handling
- Add "Remember me" preferences
- Build session management UI (view active sessions)
- Add multi-device session sync
