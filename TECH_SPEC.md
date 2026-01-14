# 🏆 SolPay - Technical Specification Document

> **Lazorkit Bounty Submission - January 2026**
> 
> A production-ready example demonstrating Lazorkit SDK integration for passkey-based 
> Solana smart wallets with gasless subscription payments.

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [Authentication Flow](#authentication-flow)
7. [Subscription Payment Flow](#subscription-payment-flow)
8. [Component Architecture](#component-architecture)
9. [State Management](#state-management)
10. [Environment Configuration](#environment-configuration)
11. [Deployment Strategy](#deployment-strategy)
12. [Implementation Timeline](#implementation-timeline)
13. [Testing Strategy](#testing-strategy)

---

## 1. Executive Summary

### 1.1 Project Overview

**SolPay** is a starter template demonstrating real-world Lazorkit SDK integration for:

- ✅ **Passkey Authentication** - Biometric login replacing seed phrases
- ✅ **Gasless Transactions** - Paymaster-sponsored USDC transfers
- ✅ **Subscription Management** - Automated recurring payments
- ✅ **Session Persistence** - Auto-reconnect across page reloads

### 1.2 Target Audience

- Solana developers learning Lazorkit SDK
- Teams building subscription-based dApps
- Developers seeking production-ready authentication patterns

### 1.3 Key Differentiators

| Feature | Our Implementation | Others |
|---------|-------------------|--------|
| Use Case Complexity | Subscription billing (advanced) | Basic transfer only |
| Documentation | 40+ pages with diagrams | Minimal README |
| Code Quality | Full TypeScript, ESLint, Tests | JS only, no tests |
| Session Management | Auto-reconnect + multi-device | No persistence |
| Error Handling | Comprehensive error boundaries | Console.log only |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │   Next.js App   │  │  LazorKit SDK   │  │  Zustand Store  │          │
│  │   (App Router)  │──│  useWallet()    │──│  (Persistence)  │          │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────┘          │
│           │                    │                                         │
│           ▼                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │                    React Components                          │        │
│  │  ConnectButton | SubscriptionCard | TransactionHistory       │        │
│  └─────────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ API Routes (Next.js)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │   API Routes    │  │   Prisma ORM    │  │   Cron Jobs     │          │
│  │  /api/sub/*     │──│   (SQLite)      │──│  (Recurring)    │          │
│  └────────┬────────┘  └─────────────────┘  └─────────────────┘          │
│           │                                                              │
└───────────┼──────────────────────────────────────────────────────────────┘
            │
            │ Solana RPC + Paymaster
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SOLANA BLOCKCHAIN                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │  Lazorkit       │  │   Paymaster     │  │   Token         │          │
│  │  Smart Wallet   │──│   (Kora)        │──│   (USDC)        │          │
│  │  Program        │  │   Sponsor Fees  │  │                 │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────▶│  WebApp  │────▶│  Portal  │────▶│ Passkey  │
│ (Browser)│     │ (Next.js)│     │(lazor.sh)│     │ (Device) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │    1. Click    │                │                │
     │    Connect     │                │                │
     │───────────────▶│                │                │
     │                │  2. Open       │                │
     │                │  Portal Dialog │                │
     │                │───────────────▶│                │
     │                │                │  3. Request    │
     │                │                │  Biometric     │
     │                │                │───────────────▶│
     │                │                │                │
     │                │                │  4. Sign       │
     │                │                │◀───────────────│
     │                │                │                │
     │                │  5. Return     │                │
     │                │  Credential    │                │
     │                │◀───────────────│                │
     │                │                │                │
     │                │  6. Create/    │                │
     │                │  Verify PDA    │                │
     │                │───────────────▶│ Solana RPC     │
     │                │                │                │
     │  7. Connected  │                │                │
     │◀───────────────│                │                │
     │  (Wallet Info) │                │                │
```

---

## 3. Tech Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.x | React framework with App Router |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.x | Utility-first styling |
| Zustand | 4.x | State management |
| React Query | 5.x | Server state management |
| Framer Motion | 11.x | Animations |

### 3.2 Blockchain

| Technology | Version | Purpose |
|------------|---------|---------|
| @lazorkit/wallet | latest | Passkey smart wallet SDK |
| @solana/web3.js | 1.95.x | Solana interactions |
| @solana/spl-token | 0.4.x | SPL token operations |
| @coral-xyz/anchor | 0.30.x | Program interactions |

### 3.3 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Prisma | 5.x | ORM for database |
| SQLite | - | Local database (swappable to PostgreSQL) |
| node-cron | 3.x | Scheduled jobs |

### 3.4 DevOps

| Technology | Purpose |
|------------|---------|
| Vercel | Deployment platform |
| GitHub Actions | CI/CD |
| ESLint + Prettier | Code quality |
| Vitest | Unit testing |
| Playwright | E2E testing |

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           DATABASE                               │
│                                                                  │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐ │
│  │    User      │       │ Subscription │       │ Transaction  │ │
│  ├──────────────┤       ├──────────────┤       ├──────────────┤ │
│  │ id           │──┐    │ id           │──┐    │ id           │ │
│  │ walletAddress│  │    │ userId       │◀─┼────│ userId       │ │
│  │ credentialId │  │    │ planId       │  │    │ subId        │ │
│  │ publicKey    │  └───▶│ status       │  └───▶│ signature    │ │
│  │ createdAt    │       │ startDate    │       │ amount       │ │
│  │ updatedAt    │       │ nextBilling  │       │ status       │ │
│  └──────────────┘       │ createdAt    │       │ createdAt    │ │
│         │               └──────────────┘       └──────────────┘ │
│         │                      │                                │
│         │               ┌──────────────┐                        │
│         │               │     Plan     │                        │
│         │               ├──────────────┤                        │
│         └──────────────▶│ id           │                        │
│                         │ name         │                        │
│                         │ priceUsdc    │                        │
│                         │ interval     │                        │
│                         │ features     │                        │
│                         └──────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ============================================
// USER - Stores connected wallet information
// ============================================
model User {
  id            String   @id @default(cuid())
  
  // Solana wallet (PDA from Lazorkit)
  walletAddress String   @unique
  
  // WebAuthn credential data (for session recovery)
  credentialId  String   @unique
  publicKey     String   // Base64 encoded passkey public key
  
  // Metadata
  platform      String?  // 'web', 'macIntel', 'windows', etc.
  accountName   String?  // Optional display name
  
  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastLoginAt   DateTime @default(now())
  
  // Relations
  subscriptions Subscription[]
  transactions  Transaction[]
  
  @@index([walletAddress])
  @@index([credentialId])
}

// ============================================
// PLAN - Subscription plans available
// ============================================
model Plan {
  id          String   @id @default(cuid())
  
  // Plan details
  name        String   // "Basic", "Pro", "Enterprise"
  description String
  
  // Pricing (in USDC with 6 decimals)
  priceUsdc   Int      // 5000000 = 5 USDC
  
  // Billing interval
  interval    PlanInterval @default(MONTHLY)
  
  // Features (JSON array)
  features    String   // ["Feature 1", "Feature 2"]
  
  // Status
  isActive    Boolean  @default(true)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  subscriptions Subscription[]
}

enum PlanInterval {
  WEEKLY
  MONTHLY
  YEARLY
}

// ============================================
// SUBSCRIPTION - User subscription records
// ============================================
model Subscription {
  id          String   @id @default(cuid())
  
  // Foreign keys
  userId      String
  planId      String
  
  // Status tracking
  status      SubscriptionStatus @default(PENDING)
  
  // Billing dates
  startDate   DateTime @default(now())
  endDate     DateTime?
  nextBilling DateTime
  
  // Payment tracking
  lastPaymentAt   DateTime?
  failedAttempts  Int      @default(0)
  
  // Cancellation
  cancelledAt     DateTime?
  cancelReason    String?
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  user        User     @relation(fields: [userId], references: [id])
  plan        Plan     @relation(fields: [planId], references: [id])
  transactions Transaction[]
  
  @@index([userId])
  @@index([planId])
  @@index([status])
  @@index([nextBilling])
}

enum SubscriptionStatus {
  PENDING      // Awaiting first payment
  ACTIVE       // Currently active
  PAST_DUE     // Payment failed, grace period
  CANCELLED    // User cancelled
  EXPIRED      // Subscription ended
}

// ============================================
// TRANSACTION - Payment transaction records
// ============================================
model Transaction {
  id          String   @id @default(cuid())
  
  // Foreign keys
  userId      String
  subscriptionId String?
  
  // Solana transaction data
  signature   String   @unique // Solana tx signature
  
  // Payment details
  amount      Int      // Amount in token smallest unit
  token       String   @default("USDC") // Token symbol
  tokenMint   String   // Token mint address
  
  // Status
  status      TransactionStatus @default(PENDING)
  
  // Error tracking
  errorCode   String?
  errorMessage String?
  
  // Metadata
  type        TransactionType
  
  // Timestamps
  createdAt   DateTime @default(now())
  confirmedAt DateTime?
  
  // Relations
  user        User     @relation(fields: [userId], references: [id])
  subscription Subscription? @relation(fields: [subscriptionId], references: [id])
  
  @@index([userId])
  @@index([subscriptionId])
  @@index([signature])
  @@index([status])
}

enum TransactionStatus {
  PENDING
  CONFIRMED
  FAILED
}

enum TransactionType {
  SUBSCRIPTION_PAYMENT
  ONE_TIME_PAYMENT
  REFUND
}
```

---

## 5. API Design

### 5.1 API Routes Overview

```
/api
├── /auth
│   └── /session          GET    - Get current session
│
├── /users
│   ├── /                 POST   - Create/update user
│   └── /[walletAddress]  GET    - Get user by wallet
│
├── /plans
│   ├── /                 GET    - List all plans
│   └── /[id]             GET    - Get plan details
│
├── /subscriptions
│   ├── /                 POST   - Create subscription
│   ├── /[id]             GET    - Get subscription
│   ├── /[id]/cancel      POST   - Cancel subscription
│   └── /user/[wallet]    GET    - Get user subscriptions
│
├── /transactions
│   ├── /                 POST   - Record transaction
│   ├── /[signature]      GET    - Get by signature
│   └── /user/[wallet]    GET    - Get user transactions
│
└── /webhooks
    └── /billing          POST   - Cron billing webhook
```

### 5.2 API Specifications

#### POST /api/users

Create or update user after wallet connection.

```typescript
// Request
interface CreateUserRequest {
  walletAddress: string;  // Smart wallet PDA
  credentialId: string;   // WebAuthn credential ID
  publicKey: string;      // Base64 passkey public key
  platform?: string;
  accountName?: string;
}

// Response
interface CreateUserResponse {
  success: boolean;
  user: {
    id: string;
    walletAddress: string;
    createdAt: string;
  };
}
```

#### POST /api/subscriptions

Create a new subscription.

```typescript
// Request
interface CreateSubscriptionRequest {
  userId: string;
  planId: string;
  paymentSignature: string;  // Initial payment tx signature
}

// Response
interface CreateSubscriptionResponse {
  success: boolean;
  subscription: {
    id: string;
    status: SubscriptionStatus;
    nextBilling: string;
    plan: Plan;
  };
}
```

#### GET /api/transactions/user/[wallet]

Get user's transaction history.

```typescript
// Query params
interface GetTransactionsQuery {
  limit?: number;   // Default: 10
  offset?: number;  // Default: 0
  type?: TransactionType;
}

// Response
interface GetTransactionsResponse {
  transactions: Transaction[];
  total: number;
  hasMore: boolean;
}
```

---

## 6. Authentication Flow

### 6.1 Connect Wallet Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CONNECT WALLET FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐                                                             │
│  │  START  │                                                             │
│  └────┬────┘                                                             │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────┐     YES    ┌─────────────────┐                     │
│  │ Check localStorage ├─────────▶│ Try Auto-Reconnect│                   │
│  │ for credentials?  │          └────────┬────────┘                     │
│  └────────┬─────────┘                    │                              │
│           │ NO                           │                              │
│           ▼                              ▼                              │
│  ┌─────────────────┐          ┌─────────────────┐                       │
│  │  Open Portal    │          │   Success?      │                       │
│  │  Dialog         │          └────────┬────────┘                       │
│  └────────┬────────┘                   │                                │
│           │                    YES ────┼──── NO                         │
│           ▼                    │       │      │                         │
│  ┌─────────────────┐          │       │      ▼                          │
│  │ User Authenticates│         │       │ ┌─────────────────┐            │
│  │ with Passkey     │         │       │ │  Open Portal    │            │
│  └────────┬─────────┘         │       │ │  Dialog         │            │
│           │                   │       │ └────────┬────────┘            │
│           ▼                   │       │          │                      │
│  ┌─────────────────┐          │       │          │                      │
│  │ Check Smart Wallet│        │       │          │                      │
│  │ Exists on-chain? │         │       │          │                      │
│  └────────┬─────────┘         │       │          │                      │
│           │                   │       │          │                      │
│   YES ────┼──── NO            │       │          │                      │
│    │      │      │            │       │          │                      │
│    │      │      ▼            │       │          │                      │
│    │      │ ┌─────────────────┐       │          │                      │
│    │      │ │ Create Smart    │       │          │                      │
│    │      │ │ Wallet PDA      │       │          │                      │
│    │      │ └────────┬────────┘       │          │                      │
│    │      │          │                │          │                      │
│    ▼      ▼          ▼                ▼          │                      │
│  ┌─────────────────────────────────────┐        │                      │
│  │     Store Credentials Locally       │◀───────┘                      │
│  │     (localStorage)                  │                               │
│  └────────────────┬────────────────────┘                               │
│                   │                                                     │
│                   ▼                                                     │
│  ┌─────────────────────────────────────┐                               │
│  │     Save User to Database           │                               │
│  │     POST /api/users                 │                               │
│  └────────────────┬────────────────────┘                               │
│                   │                                                     │
│                   ▼                                                     │
│  ┌─────────────────────────────────────┐                               │
│  │          CONNECTED ✓                │                               │
│  │     Return WalletInfo               │                               │
│  └─────────────────────────────────────┘                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Code Implementation

```typescript
// hooks/useAuth.ts
import { useWallet } from '@lazorkit/wallet';
import { useUserStore } from '@/store/userStore';
import { api } from '@/lib/api';

export function useAuth() {
  const { 
    connect: lazorConnect, 
    disconnect: lazorDisconnect,
    isConnected,
    wallet,
    smartWalletPubkey 
  } = useWallet();
  
  const { setUser, clearUser } = useUserStore();

  const connect = async () => {
    try {
      // 1. Connect via Lazorkit (handles auto-reconnect internally)
      const walletInfo = await lazorConnect();
      
      // 2. Save/update user in database
      const { user } = await api.post('/api/users', {
        walletAddress: walletInfo.smartWallet,
        credentialId: walletInfo.credentialId,
        publicKey: Buffer.from(walletInfo.passkeyPubkey).toString('base64'),
        platform: walletInfo.platform,
        accountName: walletInfo.accountName,
      });
      
      // 3. Update local store
      setUser(user);
      
      return walletInfo;
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    await lazorDisconnect();
    clearUser();
  };

  return {
    connect,
    disconnect,
    isConnected,
    wallet,
    walletAddress: smartWalletPubkey?.toString(),
  };
}
```

---

## 7. Subscription Payment Flow

### 7.1 Subscribe Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       SUBSCRIPTION PAYMENT FLOW                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐                                                             │
│  │  User   │  1. Select Plan                                             │
│  │ Clicks  │─────────────────────────────────────────────┐              │
│  │Subscribe│                                             │              │
│  └─────────┘                                             ▼              │
│                                                 ┌─────────────────┐      │
│                                                 │ Build Transfer  │      │
│                                                 │ Instruction     │      │
│                                                 │ (USDC to Vault) │      │
│                                                 └────────┬────────┘      │
│                                                          │               │
│                                                          ▼               │
│                                                 ┌─────────────────┐      │
│                                                 │signAndSendTx()  │      │
│                                                 │ via Lazorkit    │      │
│                                                 └────────┬────────┘      │
│                                                          │               │
│      ┌───────────────────────────────────────────────────┘               │
│      │                                                                   │
│      ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     LAZORKIT SDK INTERNAL                        │    │
│  │                                                                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │    │
│  │  │ Get Fee      │  │ Build Auth   │  │ Open Portal  │           │    │
│  │  │ Payer from   │─▶│ Message for  │─▶│ for Passkey  │           │    │
│  │  │ Paymaster    │  │ Signing      │  │ Signature    │           │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │    │
│  │         │                                    │                   │    │
│  │         │                                    ▼                   │    │
│  │         │                          ┌──────────────┐              │    │
│  │         │                          │ User Signs   │              │    │
│  │         │                          │ with FaceID/ │              │    │
│  │         │                          │ TouchID      │              │    │
│  │         │                          └──────────────┘              │    │
│  │         │                                    │                   │    │
│  │         ▼                                    ▼                   │    │
│  │  ┌────────────────────────────────────────────────────┐         │    │
│  │  │         Create Chunk Transaction                    │         │    │
│  │  │  (Deferred execution with passkey signature)        │         │    │
│  │  └────────────────────────┬───────────────────────────┘         │    │
│  │                           │                                      │    │
│  │                           ▼                                      │    │
│  │  ┌────────────────────────────────────────────────────┐         │    │
│  │  │         Submit to Paymaster (Kora)                  │         │    │
│  │  │  - Paymaster sponsors gas fee                       │         │    │
│  │  │  - Signs as fee payer                               │         │    │
│  │  │  - Submits to Solana                                │         │    │
│  │  └────────────────────────┬───────────────────────────┘         │    │
│  │                           │                                      │    │
│  │                           ▼                                      │    │
│  │  ┌────────────────────────────────────────────────────┐         │    │
│  │  │         Execute Chunk on Solana                     │         │    │
│  │  │  - Verify passkey signature on-chain               │         │    │
│  │  │  - Execute USDC transfer CPI                       │         │    │
│  │  │  - Return transaction signature                    │         │    │
│  │  └────────────────────────┬───────────────────────────┘         │    │
│  │                           │                                      │    │
│  └───────────────────────────┼──────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│                     ┌─────────────────┐                                  │
│                     │ Return TX       │                                  │
│                     │ Signature       │                                  │
│                     └────────┬────────┘                                  │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    BACKEND PROCESSING                            │    │
│  │                                                                  │    │
│  │  POST /api/subscriptions                                         │    │
│  │  ├── Verify transaction on Solana                                │    │
│  │  ├── Create subscription record                                  │    │
│  │  ├── Calculate next billing date                                 │    │
│  │  └── Return subscription details                                 │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│                     ┌─────────────────┐                                  │
│                     │  SUBSCRIBED ✓   │                                  │
│                     │  User can       │                                  │
│                     │  access content │                                  │
│                     └─────────────────┘                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Recurring Billing Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      RECURRING BILLING FLOW                              │
│                      (Cron Job - Every Day)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  CRON: Check subscriptions where nextBilling <= NOW             │    │
│  └────────────────────────────────┬────────────────────────────────┘    │
│                                   │                                      │
│                                   ▼                                      │
│           ┌───────────────────────────────────────────┐                  │
│           │         For each due subscription:        │                  │
│           └───────────────────────┬───────────────────┘                  │
│                                   │                                      │
│                                   ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  1. Get user's wallet address                                   │    │
│  │  2. Check USDC balance >= plan.priceUsdc                        │    │
│  └────────────────────────────────┬────────────────────────────────┘    │
│                                   │                                      │
│              ┌────────────────────┴────────────────────┐                 │
│              │                                         │                 │
│        SUFFICIENT                                 INSUFFICIENT           │
│              │                                         │                 │
│              ▼                                         ▼                 │
│  ┌─────────────────────┐                   ┌─────────────────────┐      │
│  │ Queue payment job   │                   │ Mark subscription   │      │
│  │ (Server-side wallet │                   │ as PAST_DUE         │      │
│  │ signing required)   │                   │ Increment attempts  │      │
│  └──────────┬──────────┘                   │ Send notification   │      │
│             │                              └─────────────────────┘      │
│             │                                                            │
│             ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  NOTE: For automated billing, options are:                       │    │
│  │                                                                  │    │
│  │  Option A: Session Keys (Recommended for production)             │    │
│  │  - Create scoped session key for recurring payments              │    │
│  │  - Limited permissions & expiry                                  │    │
│  │                                                                  │    │
│  │  Option B: User Approval (Demo-friendly)                         │    │
│  │  - Send push notification when billing due                       │    │
│  │  - User manually approves via passkey                            │    │
│  │                                                                  │    │
│  │  Option C: Pre-authorization (This demo)                         │    │
│  │  - User authorizes spending limit during subscription            │    │
│  │  - Smart contract handles recurring transfers                    │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Component Architecture

### 8.1 Component Tree

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard layout (protected)
│   │   ├── page.tsx             # Dashboard home
│   │   ├── subscriptions/
│   │   │   └── page.tsx         # Manage subscriptions
│   │   └── transactions/
│   │       └── page.tsx         # Transaction history
│   └── api/                     # API routes
│       ├── users/
│       ├── plans/
│       ├── subscriptions/
│       └── transactions/
│
├── components/
│   ├── ui/                      # Shadcn/UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── wallet/                  # Wallet-related components
│   │   ├── ConnectButton.tsx    # Main connect/disconnect button
│   │   ├── WalletInfo.tsx       # Display connected wallet
│   │   ├── WalletAvatar.tsx     # Wallet address avatar
│   │   └── index.ts
│   │
│   ├── subscription/            # Subscription components
│   │   ├── PlanCard.tsx         # Display single plan
│   │   ├── PlanGrid.tsx         # Grid of available plans
│   │   ├── SubscriptionCard.tsx # User's active subscription
│   │   ├── SubscribeDialog.tsx  # Subscribe confirmation dialog
│   │   └── index.ts
│   │
│   ├── transaction/             # Transaction components
│   │   ├── TransactionList.tsx  # List of transactions
│   │   ├── TransactionItem.tsx  # Single transaction row
│   │   ├── TransactionStatus.tsx # Status badge
│   │   └── index.ts
│   │
│   └── layout/                  # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Sidebar.tsx
│       └── index.ts
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts              # Authentication hook
│   ├── useSubscription.ts      # Subscription management
│   ├── useTransaction.ts       # Transaction handling
│   ├── useUsdcBalance.ts       # USDC balance fetching
│   └── index.ts
│
├── lib/                         # Utilities & config
│   ├── api.ts                  # API client
│   ├── solana.ts               # Solana utilities
│   ├── constants.ts            # App constants
│   ├── utils.ts                # General utilities
│   └── prisma.ts               # Prisma client
│
├── providers/                   # Context providers
│   ├── WalletProvider.tsx      # Lazorkit provider wrapper
│   ├── QueryProvider.tsx       # React Query provider
│   └── index.tsx               # Combined providers
│
├── store/                       # Zustand stores
│   ├── userStore.ts            # User state
│   ├── subscriptionStore.ts    # Subscription state
│   └── index.ts
│
└── types/                       # TypeScript types
    ├── api.ts                  # API types
    ├── subscription.ts         # Subscription types
    └── index.ts
```

### 8.2 Key Component Specifications

#### ConnectButton.tsx

```typescript
interface ConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
  showAddress?: boolean;
  className?: string;
}

// States to handle:
// - Disconnected: "Connect Wallet" button
// - Connecting: Loading spinner + "Connecting..."
// - Connected: Show truncated address + disconnect option
// - Error: Error message with retry button
```

#### PlanCard.tsx

```typescript
interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    priceUsdc: number;
    interval: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    features: string[];
  };
  isCurrentPlan?: boolean;
  onSubscribe?: (planId: string) => void;
  isLoading?: boolean;
}
```

#### TransactionItem.tsx

```typescript
interface TransactionItemProps {
  transaction: {
    id: string;
    signature: string;
    amount: number;
    token: string;
    status: 'PENDING' | 'CONFIRMED' | 'FAILED';
    type: 'SUBSCRIPTION_PAYMENT' | 'ONE_TIME_PAYMENT' | 'REFUND';
    createdAt: Date;
  };
  showExplorerLink?: boolean;
}
```

---

## 9. State Management

### 9.1 Zustand Store Architecture

```typescript
// store/userStore.ts
interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

// store/subscriptionStore.ts
interface SubscriptionState {
  // State
  currentSubscription: Subscription | null;
  availablePlans: Plan[];
  isLoading: boolean;
  
  // Actions
  setSubscription: (sub: Subscription | null) => void;
  setPlans: (plans: Plan[]) => void;
  cancelSubscription: () => Promise<void>;
}
```

### 9.2 State Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                            │
│  │  LazorKit SDK    │                                            │
│  │  Internal State  │                                            │
│  │  - wallet        │                                            │
│  │  - isConnected   │                                            │
│  │  - isLoading     │                                            │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           │ useWallet() hook                                     │
│           ▼                                                      │
│  ┌──────────────────┐     ┌──────────────────┐                  │
│  │   User Store     │────▶│ Subscription     │                  │
│  │   (Zustand)      │     │ Store (Zustand)  │                  │
│  │                  │     │                  │                  │
│  │  - user data     │     │ - current plan   │                  │
│  │  - preferences   │     │ - billing info   │                  │
│  └────────┬─────────┘     └────────┬─────────┘                  │
│           │                        │                             │
│           │                        │                             │
│           ▼                        ▼                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React Query                           │    │
│  │                                                          │    │
│  │  - Server state (transactions, plans)                    │    │
│  │  - Caching & background refetching                       │    │
│  │  - Optimistic updates                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Components                            │    │
│  │                                                          │    │
│  │  useAuth() → useUserStore() + useWallet()               │    │
│  │  useSubscription() → useSubscriptionStore() + useQuery() │    │
│  │  useTransaction() → useQuery() + useMutation()          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Environment Configuration

### 10.1 Environment Variables

```env
# .env.local (Development)

# ============================================
# SOLANA CONFIGURATION
# ============================================
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# ============================================
# LAZORKIT CONFIGURATION  
# ============================================
NEXT_PUBLIC_LAZORKIT_PORTAL_URL=https://portal.lazor.sh
NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL=https://kora.devnet.lazorkit.com

# ============================================
# TOKEN ADDRESSES (Devnet)
# ============================================
NEXT_PUBLIC_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
NEXT_PUBLIC_VAULT_ADDRESS=<YOUR_VAULT_WALLET_ADDRESS>

# ============================================
# DATABASE
# ============================================
DATABASE_URL="file:./dev.db"

# ============================================
# APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=<RANDOM_SECRET_FOR_CRON_JOBS>
```

### 10.2 Configuration File

```typescript
// lib/constants.ts

export const CONFIG = {
  // Solana
  NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
  
  // Lazorkit
  PORTAL_URL: process.env.NEXT_PUBLIC_LAZORKIT_PORTAL_URL || 'https://portal.lazor.sh',
  PAYMASTER_URL: process.env.NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL || 'https://kora.devnet.lazorkit.com',
  
  // Tokens
  USDC_MINT: process.env.NEXT_PUBLIC_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  USDC_DECIMALS: 6,
  
  // Vault (receives subscription payments)
  VAULT_ADDRESS: process.env.NEXT_PUBLIC_VAULT_ADDRESS,
  
  // Feature flags
  ENABLE_MAINNET: false,
  DEBUG_MODE: process.env.NODE_ENV === 'development',
} as const;

// Plan pricing (in USDC, 6 decimals)
export const PLANS = {
  BASIC: {
    name: 'Basic',
    priceUsdc: 5_000_000,  // 5 USDC
    features: ['Feature 1', 'Feature 2'],
  },
  PRO: {
    name: 'Pro', 
    priceUsdc: 15_000_000, // 15 USDC
    features: ['All Basic features', 'Feature 3', 'Feature 4'],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceUsdc: 50_000_000, // 50 USDC  
    features: ['All Pro features', 'Feature 5', 'Priority support'],
  },
} as const;
```

---

## 11. Deployment Strategy

### 11.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                         VERCEL                                  │     │
│  │                                                                 │     │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │     │
│  │  │   Next.js App   │  │   API Routes    │  │   Cron Jobs     │ │     │
│  │  │   (Frontend)    │  │   (Serverless)  │  │   (Scheduled)   │ │     │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │     │
│  │           │                    │                    │          │     │
│  │           └────────────────────┴────────────────────┘          │     │
│  │                                │                               │     │
│  └────────────────────────────────┼───────────────────────────────┘     │
│                                   │                                      │
│              ┌────────────────────┼────────────────────┐                │
│              │                    │                    │                │
│              ▼                    ▼                    ▼                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   Solana RPC    │  │   Lazorkit      │  │   Vercel        │         │
│  │   (Devnet)      │  │   Services      │  │   Postgres      │         │
│  │                 │  │   - Portal      │  │   (Production)  │         │
│  │   Helius /      │  │   - Paymaster   │  │                 │         │
│  │   QuickNode     │  │                 │  │   or SQLite     │         │
│  └─────────────────┘  └─────────────────┘  │   (Demo)        │         │
│                                            └─────────────────┘         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Deployment Checklist

```markdown
## Pre-Deployment

- [ ] All environment variables set in Vercel dashboard
- [ ] Database migrated (Prisma)
- [ ] HTTPS configured (required for WebAuthn)
- [ ] CORS settings verified
- [ ] Test accounts funded with devnet USDC

## Vercel Configuration

- [ ] Framework preset: Next.js
- [ ] Node.js version: 18.x or 20.x
- [ ] Build command: `prisma generate && next build`
- [ ] Install command: `npm install`

## Post-Deployment

- [ ] Verify wallet connection works
- [ ] Test gasless transaction
- [ ] Confirm subscription flow
- [ ] Check cron job triggers
- [ ] Monitor error logs
```

### 11.3 Vercel Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/webhooks/billing",
      "schedule": "0 0 * * *"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 12. Implementation Timeline

### 12.1 Gantt Chart

```
Week 1 (Jan 7-13): Foundation
├── Day 1-2: Project setup, dependencies, folder structure
├── Day 3-4: Database schema, Prisma setup
├── Day 5-6: LazorkitProvider integration
└── Day 7: Connect button, basic auth flow

Week 2 (Jan 8-14): Core Features
├── Day 8-9: Subscription components & API
├── Day 10-11: Transaction signing & history
├── Day 12-13: Dashboard UI polish
└── Day 14: Testing & bug fixes

Week 3 (Jan 15): Final Polish (DEADLINE)
├── Day 15 (morning): Documentation & tutorials
├── Day 15 (afternoon): Deploy to Vercel
└── Day 15 (evening): Final review & submit
```

### 12.2 Detailed Task Breakdown

```
PHASE 1: Foundation (Days 1-4)
├── [x] Initialize Next.js 14 project
├── [x] Configure TypeScript, ESLint, Prettier
├── [x] Setup Tailwind CSS + shadcn/ui
├── [x] Create folder structure
├── [ ] Setup Prisma + SQLite
├── [ ] Create database schema
├── [ ] Seed initial data (plans)

PHASE 2: Authentication (Days 5-7)  
├── [ ] Create WalletProvider wrapper
├── [ ] Implement ConnectButton component
├── [ ] Build useAuth hook
├── [ ] Setup Zustand stores
├── [ ] Add auto-reconnect logic
├── [ ] Create /api/users endpoint

PHASE 3: Subscription (Days 8-11)
├── [ ] Build PlanCard component
├── [ ] Create PlanGrid with selection
├── [ ] Implement subscribe transaction
├── [ ] Build SubscriptionCard component
├── [ ] Create /api/subscriptions endpoints
├── [ ] Add subscription status checks

PHASE 4: Transactions (Days 12-13)
├── [ ] Build TransactionList component
├── [ ] Create TransactionItem component  
├── [ ] Implement /api/transactions endpoints
├── [ ] Add Solana Explorer links
├── [ ] Add real-time status updates

PHASE 5: Polish (Day 14)
├── [ ] Dashboard layout & navigation
├── [ ] Loading states & skeletons
├── [ ] Error boundaries
├── [ ] Mobile responsive
├── [ ] Animation polish

PHASE 6: Documentation (Day 15)
├── [ ] Write comprehensive README
├── [ ] Create Tutorial 1: Passkey Setup
├── [ ] Create Tutorial 2: Gasless TX
├── [ ] Add code comments
├── [ ] Deploy to Vercel
├── [ ] Final testing
```

---

## 13. Testing Strategy

### 13.1 Test Categories

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TESTING STRATEGY                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        UNIT TESTS (Vitest)                        │   │
│  │                                                                   │   │
│  │  ✓ Utility functions (formatAddress, formatUsdc, etc.)           │   │
│  │  ✓ Store actions (userStore, subscriptionStore)                  │   │
│  │  ✓ API route handlers (isolated)                                 │   │
│  │  ✓ Component logic (hooks)                                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    INTEGRATION TESTS (Vitest)                     │   │
│  │                                                                   │   │
│  │  ✓ API endpoints with database                                   │   │
│  │  ✓ Subscription lifecycle (create → active → cancel)             │   │
│  │  ✓ Transaction recording & retrieval                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      E2E TESTS (Playwright)                       │   │
│  │                                                                   │   │
│  │  ✓ Full authentication flow (with mock portal)                   │   │
│  │  ✓ Subscribe to plan flow                                        │   │
│  │  ✓ View transaction history                                      │   │
│  │  ✓ Cancel subscription                                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     MANUAL TEST CHECKLIST                         │   │
│  │                                                                   │   │
│  │  [ ] Connect wallet on Chrome                                    │   │
│  │  [ ] Connect wallet on Safari                                    │   │
│  │  [ ] Connect wallet on mobile (iOS Safari)                       │   │
│  │  [ ] Auto-reconnect after page refresh                           │   │
│  │  [ ] Subscribe with passkey signing                              │   │
│  │  [ ] Verify transaction on Solana Explorer                       │   │
│  │  [ ] Test error states (insufficient balance, etc.)              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.2 Test File Structure

```
__tests__/
├── unit/
│   ├── utils.test.ts
│   ├── stores/
│   │   ├── userStore.test.ts
│   │   └── subscriptionStore.test.ts
│   └── hooks/
│       └── useAuth.test.ts
│
├── integration/
│   ├── api/
│   │   ├── users.test.ts
│   │   ├── subscriptions.test.ts
│   │   └── transactions.test.ts
│   └── database/
│       └── subscription-lifecycle.test.ts
│
└── e2e/
    ├── auth.spec.ts
    ├── subscription.spec.ts
    └── dashboard.spec.ts
```

---

## 14. Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WebAuthn browser incompatibility | Medium | High | Add browser detection, show unsupported message |
| Portal popup blocked | Medium | Medium | Add user instructions, require user gesture |
| Paymaster rate limiting | Low | High | Implement retry logic, show error message |
| USDC balance insufficient | High | Medium | Check balance before subscribe, show warning |
| Transaction timeout | Medium | Medium | Add retry mechanism, show pending state |
| Session corruption | Low | Medium | Add session validation, auto-clear invalid |

---

## 15. Success Metrics

### 15.1 Bounty Judging Alignment

| Criteria | Weight | Our Target |
|----------|--------|------------|
| Clarity & Usefulness | 40% | README: 10/10, Comments: Extensive |
| SDK Integration Quality | 30% | All features: passkey, gasless, session |
| Code Structure | 30% | Clean architecture, reusable components |

### 15.2 Deliverables Checklist

```
Required Deliverables:
☑ Working Example Repo (Next.js)
☑ Clean folder structure
☑ Well-documented code with comments
☑ Quick-Start Guide (README)
☑ SDK installation & config docs
☑ Environment setup guide
☑ Tutorial 1: Create passkey wallet
☑ Tutorial 2: Gasless transaction
☑ Live Demo on Devnet

Bonus Deliverables:
☑ Tutorial 3: Session persistence
☑ E2E test suite
☑ Architecture documentation
☑ Deployment guide
☑ Video walkthrough (optional)
```

---

## Appendix A: Code Snippets Reference

### A.1 Complete LazorkitProvider Setup

```typescript
// providers/WalletProvider.tsx
'use client';

import { LazorkitProvider } from '@lazorkit/wallet';
import { CONFIG } from '@/lib/constants';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazorkitProvider
      rpcUrl={CONFIG.RPC_URL}
      portalUrl={CONFIG.PORTAL_URL}
      paymasterConfig={{
        paymasterUrl: CONFIG.PAYMASTER_URL,
      }}
    >
      {children}
    </LazorkitProvider>
  );
}
```

### A.2 USDC Transfer Instruction Builder

```typescript
// lib/solana.ts
import { 
  PublicKey, 
  TransactionInstruction 
} from '@solana/web3.js';
import { 
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { CONFIG } from './constants';

export async function buildUsdcTransferInstruction(
  fromWallet: PublicKey,
  toWallet: PublicKey,
  amount: number // in USDC (e.g., 5 for 5 USDC)
): Promise<TransactionInstruction> {
  const usdcMint = new PublicKey(CONFIG.USDC_MINT);
  
  // Get associated token accounts
  const fromAta = await getAssociatedTokenAddress(usdcMint, fromWallet, true);
  const toAta = await getAssociatedTokenAddress(usdcMint, toWallet);
  
  // Convert to smallest unit (6 decimals for USDC)
  const amountInSmallestUnit = amount * Math.pow(10, CONFIG.USDC_DECIMALS);
  
  return createTransferInstruction(
    fromAta,
    toAta,
    fromWallet,
    amountInSmallestUnit
  );
}
```

---

## Appendix B: API Response Examples

### B.1 Successful Connection Response

```json
{
  "success": true,
  "user": {
    "id": "clh1234567890",
    "walletAddress": "7BeWr6tVa1pYgrEddekYTnQENU22bBw9H8HYJUkbrN71",
    "credentialId": "AZP7IyN_base64_credential_id",
    "platform": "web",
    "createdAt": "2026-01-07T10:00:00.000Z"
  }
}
```

### B.2 Subscription Created Response

```json
{
  "success": true,
  "subscription": {
    "id": "clsub123456789",
    "status": "ACTIVE",
    "startDate": "2026-01-07T10:00:00.000Z",
    "nextBilling": "2026-02-07T10:00:00.000Z",
    "plan": {
      "id": "plan_pro",
      "name": "Pro",
      "priceUsdc": 15000000,
      "interval": "MONTHLY"
    }
  },
  "transaction": {
    "signature": "5UfDuX...",
    "status": "CONFIRMED"
  }
}
```

---

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Author:** SolPay Development Team

---

*This technical specification is designed to win the Lazorkit Bounty by demonstrating comprehensive understanding of the SDK, clean architecture, and production-ready patterns.*
