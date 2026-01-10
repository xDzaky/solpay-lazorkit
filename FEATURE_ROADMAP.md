# 🚀 SolPay Feature Roadmap & Tech Spec

> Planning dokumen untuk fitur tambahan yang akan diimplementasikan

---

## ✅ IMPLEMENTATION COMPLETE

**All features have been successfully implemented on January 10, 2026**

---

## 📊 Analisis Gap: Current vs Ideal

### ✅ Sudah Diimplementasikan

| Fitur | Status | Lokasi |
|-------|--------|--------|
| Landing Page | ✅ Done | `/` (page.tsx) |
| Passkey Authentication | ✅ Done | ConnectButton.tsx |
| Subscription Plans | ✅ Done | Pricing.tsx |
| Mock Mode | ✅ Done | mock-mode.ts |
| Transaction History | ✅ Done | TransactionHistory.tsx |
| Subscription Dashboard | ✅ Done | SubscriptionDashboard.tsx |
| Confetti Celebration | ✅ Done | Pricing.tsx |
| Cancel Subscription | ✅ Done | SubscriptionDashboard.tsx |
| Download Receipt | ✅ Done | SubscriptionDashboard.tsx |
| **Multi-Page Routing** | ✅ Done | `(protected)/` route group |
| **Dashboard Page** | ✅ Done | `/dashboard` |
| **Send Money Page** | ✅ Done | `/send` |
| **Request Money/QR** | ✅ Done | `/request` |
| **Transaction List Page** | ✅ Done | `/transactions` |
| **Settings Page** | ✅ Done | `/settings` |
| **Subscribe Page** | ✅ Done | `/subscribe` |
| **Protected Routes** | ✅ Done | ProtectedRoute.tsx |
| **Real Balance Fetching** | ✅ Done | useRealBalance.ts |
| **SOL Transfer** | ✅ Done | useSendTransaction.ts |
| **USDC Transfer** | ✅ Done | useSendTransaction.ts |
| **Desktop Sidebar** | ✅ Done | Sidebar.tsx |
| **Mobile Bottom Nav** | ✅ Done | MobileBottomNav.tsx |

### ❌ Belum Ada (Berdasarkan alur.md)

| Fitur | Priority | Kompleksitas |
|-------|----------|--------------|
| ~~Multi-Page Routing~~ | ✅ DONE | ~~Medium~~ |
| ~~Dashboard Page~~ | ✅ DONE | ~~Medium~~ |
| ~~Send Money Page~~ | ✅ DONE | ~~High~~ |
| ~~Request Money/QR~~ | ✅ DONE | ~~Medium~~ |
| ~~Transaction Detail Page~~ | ✅ DONE | ~~Low~~ |
| ~~Settings Page~~ | ✅ DONE | ~~Low~~ |
| ~~Protected Routes~~ | ✅ DONE | ~~Medium~~ |
| ~~Real Balance Fetching~~ | ✅ DONE | ~~Medium~~ |
| ~~SOL Transfer~~ | ✅ DONE | ~~Medium~~ |

---

## 🎯 Prioritas Implementasi

### Phase 1: Core Navigation ✅ COMPLETE
```
Priority: 🔴 CRITICAL
Status: ✅ DONE
```

**Tasks:**
1. ✅ Setup folder routing Next.js App Router
2. ✅ Create protected route wrapper
3. ✅ Create navigation between pages
4. ✅ Add sidebar/bottom nav for dashboard

### Phase 2: Dashboard & Send ✅ COMPLETE
```
Priority: 🔴 CRITICAL  
Status: ✅ DONE
```

**Tasks:**
1. ✅ Dashboard page dengan balance display
2. ✅ Quick actions (Send, Request, History)
3. ✅ Send Money form dengan validasi
4. ✅ Real SOL/USDC transfer

### Phase 3: Request & QR ✅ COMPLETE
```
Priority: 🟡 MEDIUM
Status: ✅ DONE
```

**Tasks:**
1. ✅ Generate QR code untuk payment request
2. ✅ Share functionality
3. ✅ Solana Pay URL generation

### Phase 4: Polish ✅ COMPLETE
```
Priority: 🟢 LOW
Status: ✅ DONE
```

**Tasks:**
1. ✅ Settings page
2. ✅ Transaction list page with filters
3. ✅ Loading skeletons
4. ✅ Clear data functionality

---

## 📁 New Folder Structure

```
src/app/
├── (public)/                    # Public pages (no auth required)
│   ├── page.tsx                 # Landing page
│   ├── about/
│   │   └── page.tsx            # About/Features page
│   └── docs/
│       └── page.tsx            # Documentation page
│
├── (protected)/                 # Protected pages (auth required)
│   ├── layout.tsx              # Dashboard layout with sidebar
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard
│   ├── send/
│   │   └── page.tsx            # Send money page
│   ├── request/
│   │   └── page.tsx            # Request money/QR page
│   ├── transactions/
│   │   ├── page.tsx            # Transaction list
│   │   └── [id]/
│   │       └── page.tsx        # Transaction detail
│   └── settings/
│       └── page.tsx            # Account settings
│
├── api/                         # Existing API routes
├── globals.css
└── layout.tsx                   # Root layout
```

---

## 🔧 Technical Specifications

### 1. Protected Route Wrapper

**File:** `src/components/auth/ProtectedRoute.tsx`

```typescript
"use client";

import { useWallet } from "@lazorkit/wallet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isConnected, isConnecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      router.push("/");
    }
  }, [isConnected, isConnecting, router]);

  if (isConnecting) {
    return <LoadingScreen />;
  }

  if (!isConnected) {
    return null;
  }

  return <>{children}</>;
}
```

---

### 2. Dashboard Page

**File:** `src/app/(protected)/dashboard/page.tsx`

**UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Sidebar          │  Main Content                       │
│  ┌─────────────┐  │  ┌───────────────────────────────┐  │
│  │ 🏠 Dashboard│  │  │  Welcome back!                │  │
│  │ 📤 Send     │  │  │  📍 7Hj4...xK9p               │  │
│  │ 📥 Request  │  │  └───────────────────────────────┘  │
│  │ 📊 History  │  │                                     │
│  │ ⚙️ Settings │  │  ┌─────────────┐ ┌─────────────┐   │
│  └─────────────┘  │  │  SOL        │ │  USDC       │   │
│                   │  │  0.00       │ │  $985.00    │   │
│                   │  └─────────────┘ └─────────────┘   │
│                   │                                     │
│                   │  Quick Actions:                     │
│                   │  [📤 Send] [📥 Request] [🔄 Swap]  │
│                   │                                     │
│                   │  Recent Transactions                │
│                   │  ┌───────────────────────────────┐  │
│                   │  │ 📤 Sent $15 (Pro Plan)        │  │
│                   │  │ 📤 Sent $5 (Basic Plan)       │  │
│                   │  └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- Balance cards (SOL + USDC)
- Quick action buttons
- Recent transactions preview
- Active subscription status

---

### 3. Send Money Page

**File:** `src/app/(protected)/send/page.tsx`

**UI Layout:**
```
┌─────────────────────────────────────────┐
│  ← Back            📤 Send Money        │
├─────────────────────────────────────────┤
│                                         │
│  Select Token:                          │
│  ┌────────┐ ┌────────┐                 │
│  │ ◉ SOL  │ │ ○ USDC │                 │
│  └────────┘ └────────┘                 │
│                                         │
│  Recipient Address:                     │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│  [📋 Paste] [📷 Scan QR]               │
│                                         │
│  Amount:                                │
│  ┌───────────────────────────────────┐ │
│  │ 0.00                              │ │
│  └───────────────────────────────────┘ │
│  Available: 1.5 SOL | [Max]            │
│                                         │
│  Memo (optional):                       │
│  ┌───────────────────────────────────┐ │
│  │ Payment for...                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  💡 Gas fees: Sponsored by Lazorkit    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │         [Send Payment]            │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Technical Flow:**
```typescript
// useSendTransaction.ts hook
export function useSendTransaction() {
  const { smartWalletPubkey, signAndSendTransaction } = useWallet();
  
  const sendSOL = async (recipient: string, amount: number) => {
    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey!,
      toPubkey: new PublicKey(recipient),
      lamports: amount * LAMPORTS_PER_SOL,
    });
    
    return await signAndSendTransaction({ instructions: [instruction] });
  };
  
  const sendUSDC = async (recipient: string, amount: number) => {
    const instruction = createTransferInstruction(
      getAssociatedTokenAddressSync(USDC_MINT, smartWalletPubkey!),
      getAssociatedTokenAddressSync(USDC_MINT, new PublicKey(recipient)),
      smartWalletPubkey!,
      amount * 1_000_000 // USDC has 6 decimals
    );
    
    return await signAndSendTransaction({ instructions: [instruction] });
  };
  
  return { sendSOL, sendUSDC };
}
```

---

### 4. Request Money / QR Code Page

**File:** `src/app/(protected)/request/page.tsx`

**UI Layout:**
```
┌─────────────────────────────────────────┐
│  ← Back           📥 Request Money      │
├─────────────────────────────────────────┤
│                                         │
│  Amount (optional):                     │
│  ┌───────────────────────────────────┐ │
│  │ 10.00                        USDC │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Description:                           │
│  ┌───────────────────────────────────┐ │
│  │ Lunch split 🍜                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │        ████████████████           │ │
│  │        ██            ██           │ │
│  │        ██  QR CODE   ██           │ │
│  │        ██            ██           │ │
│  │        ████████████████           │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Your Address:                          │
│  7Hj4x9pK2mL...qR8sT3vN                │
│                                         │
│  [📋 Copy Address] [📤 Share]          │
│                                         │
└─────────────────────────────────────────┘
```

**QR Code Data Format:**
```typescript
interface PaymentRequest {
  recipient: string;      // Solana address
  amount?: number;        // Optional amount
  token?: 'SOL' | 'USDC'; // Token type
  memo?: string;          // Optional description
  label?: string;         // Display label
}

// Encode as Solana Pay URL
// solana:<recipient>?amount=<amount>&spl-token=<mint>&memo=<memo>
```

---

### 5. Settings Page

**File:** `src/app/(protected)/settings/page.tsx`

**Sections:**
1. **Account Info**
   - Smart Wallet Address (copy, QR)
   - Credential ID
   - Platform info

2. **Preferences**
   - Default token (SOL/USDC)
   - Network (Devnet/Mainnet)
   - Mock Mode toggle

3. **Security**
   - Disconnect wallet
   - Clear session data

4. **About**
   - SDK version
   - Links to docs, GitHub, support

---

### 6. Real Balance Fetching

**File:** `src/hooks/useRealBalance.ts`

```typescript
import { useWallet } from "@lazorkit/wallet";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useQuery } from "@tanstack/react-query";
import { USDC_MINT, RPC_URL } from "@/lib/constants";

export function useRealBalance() {
  const { smartWalletPubkey, isConnected } = useWallet();
  
  const connection = new Connection(RPC_URL);
  
  // SOL Balance
  const { data: solBalance, isLoading: solLoading } = useQuery({
    queryKey: ["sol-balance", smartWalletPubkey?.toString()],
    queryFn: async () => {
      if (!smartWalletPubkey) return 0;
      const balance = await connection.getBalance(smartWalletPubkey);
      return balance / LAMPORTS_PER_SOL;
    },
    enabled: isConnected && !!smartWalletPubkey,
    refetchInterval: 30000, // Refresh every 30s
  });
  
  // USDC Balance
  const { data: usdcBalance, isLoading: usdcLoading } = useQuery({
    queryKey: ["usdc-balance", smartWalletPubkey?.toString()],
    queryFn: async () => {
      if (!smartWalletPubkey) return 0;
      try {
        const ata = getAssociatedTokenAddressSync(
          new PublicKey(USDC_MINT),
          smartWalletPubkey
        );
        const account = await getAccount(connection, ata);
        return Number(account.amount) / 1_000_000; // 6 decimals
      } catch {
        return 0; // Token account doesn't exist
      }
    },
    enabled: isConnected && !!smartWalletPubkey,
    refetchInterval: 30000,
  });
  
  return {
    solBalance: solBalance ?? 0,
    usdcBalance: usdcBalance ?? 0,
    isLoading: solLoading || usdcLoading,
  };
}
```

---

## 🎨 New Components Needed

| Component | File | Description |
|-----------|------|-------------|
| `DashboardSidebar` | `components/dashboard/Sidebar.tsx` | Navigation sidebar |
| `BalanceCard` | `components/dashboard/BalanceCard.tsx` | SOL/USDC balance display |
| `QuickActions` | `components/dashboard/QuickActions.tsx` | Send/Request/Swap buttons |
| `SendForm` | `components/send/SendForm.tsx` | Send transaction form |
| `TokenSelector` | `components/send/TokenSelector.tsx` | SOL/USDC toggle |
| `AddressInput` | `components/send/AddressInput.tsx` | Recipient input with validation |
| `PaymentQR` | `components/request/PaymentQR.tsx` | QR code generator |
| `SettingsSection` | `components/settings/SettingsSection.tsx` | Settings card |
| `ProtectedRoute` | `components/auth/ProtectedRoute.tsx` | Auth guard |
| `LoadingScreen` | `components/ui/LoadingScreen.tsx` | Full page loader |

---

## 📱 Mobile Responsive

```
Desktop (>1024px):  Sidebar + Main content
Tablet (768-1024):  Collapsible sidebar
Mobile (<768px):    Bottom navigation
```

**Bottom Navigation (Mobile):**
```
┌─────────────────────────────────────────┐
│                                         │
│            [Page Content]               │
│                                         │
├─────────────────────────────────────────┤
│  🏠      📤      📥      📊      ⚙️    │
│ Home    Send   Request  History  More  │
└─────────────────────────────────────────┘
```

---

## ⏱️ Estimated Timeline

| Phase | Tasks | Time | Priority |
|-------|-------|------|----------|
| **Phase 1** | Routing + Protected Routes | 2-3 hrs | 🔴 High |
| **Phase 2** | Dashboard + Send | 3-4 hrs | 🔴 High |
| **Phase 3** | Request + QR | 2 hrs | 🟡 Medium |
| **Phase 4** | Settings + Polish | 1-2 hrs | 🟢 Low |
| **Total** | | **8-11 hrs** | |

---

## 🏆 Competition Value Add

### Current Project Strengths:
- ✅ Subscription system (unique feature)
- ✅ Mock mode (developer-friendly)
- ✅ 4 tutorials (exceeds requirement)
- ✅ Comprehensive documentation

### After Adding Features:
- ✅ Multi-page app (shows real-world usage)
- ✅ Send money (core wallet functionality)
- ✅ QR payments (innovative UX)
- ✅ Real balance display (production-ready)
- ✅ Full user journey (onboard → use → manage)

### Competitive Advantage:
```
Other competitors: Single demo page
SolPay: Full-featured dApp with 6+ pages
```

---

## 🚀 Quick Start Implementation

### Step 1: Create folder structure
```bash
mkdir -p src/app/\(protected\)/{dashboard,send,request,transactions,settings}
mkdir -p src/components/{auth,dashboard,send,request,settings}
```

### Step 2: Create protected layout
```bash
touch src/app/\(protected\)/layout.tsx
```

### Step 3: Implement pages in order
1. Dashboard (highest value)
2. Send Money (core feature)
3. Request/QR (differentiation)
4. Settings (polish)

---

## 📝 Decision: Implement or Not?

### Option A: Submit Current Project ✅
**Pros:**
- Already complete and working
- Good documentation
- 4 tutorials
- Unique subscription feature

**Cons:**
- Single page app
- No multi-page navigation

**Competition Chance:** 70-80% for Top 3

---

### Option B: Add Core Features (Dashboard + Send)
**Additional Time:** 5-6 hours
**New Features:**
- Dashboard page
- Send money functionality
- Protected routes

**Competition Chance:** 85-90% for Top 3

---

### Option C: Full Implementation (All Features)
**Additional Time:** 10-12 hours
**New Features:**
- All pages from alur.md
- QR payments
- Real balance
- Settings

**Competition Chance:** 90-95% for 1st Place

---

## ✅ Recommendation

**Untuk deadline 15 Januari 2026:**

Jika waktu terbatas → **Submit sekarang** (current project sudah sangat bagus)

Jika ada waktu 5-6 jam → **Implement Phase 1 + 2** (Dashboard + Send)

Jika ada waktu 10+ jam → **Full implementation**

---

*Document created: January 10, 2026*
*Last updated: January 10, 2026*
