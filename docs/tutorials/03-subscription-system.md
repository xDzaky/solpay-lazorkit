# Tutorial 3: Building a Subscription Payment System

Learn how to build a complete subscription payment system using Lazorkit SDK. This tutorial covers plan management, recurring payments, and subscription lifecycle handling.

## Overview

In this tutorial, you'll learn:
- How to design subscription plans
- Implementing the payment flow with gasless transactions
- Managing subscription states
- Building a responsive plan selection UI

## Prerequisites

- Completed [Tutorial 1: Passkey Wallet Setup](./01-passkey-wallet-setup.md)
- Completed [Tutorial 2: Gasless Transactions](./02-gasless-transactions.md)
- PostgreSQL database configured (we use Neon)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUBSCRIPTION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐        │
│   │  Plans   │───▶│  Select  │───▶│  Pay     │───▶│  Active  │        │
│   │  Display │    │  Plan    │    │  (USDC)  │    │  Sub     │        │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘        │
│        │               │               │               │               │
│        │               │               │               │               │
│   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐           │
│   │ /api/   │    │ User    │    │ Lazorkit│    │ /api/   │           │
│   │ plans   │    │ Choice  │    │ Gasless │    │ subs    │           │
│   └─────────┘    └─────────┘    └─────────┘    └─────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Step 1: Database Schema for Subscriptions

First, let's set up our database models. We use Prisma with PostgreSQL:

```prisma
// prisma/schema.prisma

model Plan {
  id            String         @id @default(cuid())
  name          String
  description   String
  priceUsdc     Float          // Price in USDC
  interval      PlanInterval
  features      String[]       // Array of feature descriptions
  badge         String?        // "Most Popular", "Best Value", etc.
  isHighlighted Boolean        @default(false)
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  subscriptions Subscription[]

  @@index([isActive])
}

model Subscription {
  id               String             @id @default(cuid())
  userId           String
  user             User               @relation(fields: [userId], references: [id])
  planId           String
  plan             Plan               @relation(fields: [planId], references: [id])
  status           SubscriptionStatus @default(ACTIVE)
  currentPeriodStart DateTime         @default(now())
  currentPeriodEnd   DateTime
  cancelledAt      DateTime?
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  @@index([userId])
  @@index([status])
}

enum PlanInterval {
  WEEKLY
  MONTHLY
  YEARLY
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  PAST_DUE
}
```

## Step 2: Seed Initial Plans

Create seed data for your subscription plans:

```typescript
// prisma/seed.ts

import { PrismaClient, PlanInterval } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  {
    name: "Free",
    description: "Get started with basic features",
    priceUsdc: 0,
    interval: PlanInterval.MONTHLY,
    features: [
      "Up to 3 transactions/month",
      "Basic analytics",
      "Email support",
    ],
    badge: null,
    isHighlighted: false,
  },
  {
    name: "Pro",
    description: "Perfect for growing projects",
    priceUsdc: 9.99,
    interval: PlanInterval.MONTHLY,
    features: [
      "Unlimited transactions",
      "Advanced analytics",
      "Priority support",
      "Custom webhooks",
      "API access",
    ],
    badge: "Most Popular",
    isHighlighted: true,
  },
  {
    name: "Team",
    description: "Best for collaborative teams",
    priceUsdc: 29.99,
    interval: PlanInterval.MONTHLY,
    features: [
      "Everything in Pro",
      "5 team members",
      "Team analytics",
      "Shared wallets",
      "Audit logs",
    ],
    badge: null,
    isHighlighted: false,
  },
  {
    name: "Enterprise",
    description: "For large-scale operations",
    priceUsdc: 99.99,
    interval: PlanInterval.MONTHLY,
    features: [
      "Everything in Team",
      "Unlimited members",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "White-label options",
    ],
    badge: "Best Value",
    isHighlighted: false,
  },
];

async function main() {
  console.log("🌱 Seeding plans...");
  
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }
  
  console.log("✅ Plans seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run the seed:

```bash
pnpm db:seed
```

## Step 3: Plans API Endpoint

Create an API endpoint to fetch available plans:

```typescript
// src/app/api/plans/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { priceUsdc: "asc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
```

## Step 4: Build the Plan Card Component

Create a beautiful, interactive plan card:

```tsx
// src/components/subscription/PlanCard.tsx

"use client";

import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Sparkles } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  priceUsdc: number;
  interval: "WEEKLY" | "MONTHLY" | "YEARLY";
  features: string[];
  badge: string | null;
  isHighlighted: boolean;
}

interface PlanCardProps {
  plan: Plan;
  onSubscribe?: (plan: Plan, signature: string) => void;
}

export function PlanCard({ plan, onSubscribe }: PlanCardProps) {
  const { isConnected, smartWalletPubkey, signAndSendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!isConnected || !smartWalletPubkey) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build USDC transfer instruction
      const instructions = await buildUsdcTransferInstruction(
        smartWalletPubkey.toString(),
        VAULT_ADDRESS,
        plan.priceUsdc
      );

      // Sign and send via Lazorkit (GASLESS!)
      const signature = await signAndSendTransaction({
        instructions,
      });

      // Record in database
      await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          paymentSignature: signature,
        }),
      });

      onSubscribe?.(plan, signature);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={plan.isHighlighted ? "border-violet-500 shadow-lg" : ""}>
      <CardHeader>
        {plan.badge && (
          <Badge className="w-fit mb-2">{plan.badge}</Badge>
        )}
        <CardTitle className="flex items-center gap-2">
          {plan.isHighlighted && <Sparkles className="h-5 w-5 text-violet-500" />}
          {plan.name}
        </CardTitle>
        <p className="text-muted-foreground">{plan.description}</p>
      </CardHeader>

      <CardContent>
        {/* Price */}
        <div className="mb-6">
          <span className="text-4xl font-bold">${plan.priceUsdc}</span>
          <span className="text-muted-foreground">/{plan.interval.toLowerCase()}</span>
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSubscribe}
          disabled={isLoading || !isConnected}
          className="w-full"
          variant={plan.isHighlighted ? "default" : "outline"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : plan.priceUsdc === 0 ? (
            "Get Started Free"
          ) : (
            "Subscribe Now"
          )}
        </Button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </CardFooter>
    </Card>
  );
}
```

## Step 5: Build the Plan Grid

Create a responsive grid to display all plans:

```tsx
// src/components/subscription/PlanGrid.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { PlanCard, Plan } from "./PlanCard";
import { Skeleton } from "@/components/ui/skeleton";

export function PlanGrid() {
  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans?.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onSubscribe={(plan, sig) => {
            console.log(`Subscribed to ${plan.name}!`, sig);
          }}
        />
      ))}
    </div>
  );
}
```

## Step 6: Build the USDC Transfer Instruction

Create a helper to build Solana transfer instructions:

```typescript
// src/lib/solana.ts

import { 
  Connection, 
  PublicKey, 
  TransactionInstruction 
} from "@solana/web3.js";
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // Mainnet USDC
);
const USDC_DECIMALS = 6;

export async function buildSubscriptionPaymentInstruction(
  senderAddress: string,
  amount: number,
  vaultAddress: string
): Promise<TransactionInstruction[]> {
  const sender = new PublicKey(senderAddress);
  const vault = new PublicKey(vaultAddress);

  // Get associated token accounts
  const senderAta = await getAssociatedTokenAddress(USDC_MINT, sender);
  const vaultAta = await getAssociatedTokenAddress(USDC_MINT, vault);

  // Convert amount to smallest units (USDC has 6 decimals)
  const amountInSmallestUnits = Math.round(amount * Math.pow(10, USDC_DECIMALS));

  // Create transfer instruction
  const transferIx = createTransferInstruction(
    senderAta,
    vaultAta,
    sender,
    amountInSmallestUnits,
    [],
    TOKEN_PROGRAM_ID
  );

  return [transferIx];
}
```

## Step 7: Subscription Creation API

Handle subscription creation in the backend:

```typescript
// src/app/api/subscriptions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planId, paymentSignature } = body;

    // Get the plan to calculate period end
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    // Calculate subscription period
    const now = new Date();
    let periodEnd: Date;
    
    switch (plan.interval) {
      case "WEEKLY":
        periodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "MONTHLY":
        periodEnd = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case "YEARLY":
        periodEnd = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        status: "ACTIVE",
      },
      include: { plan: true },
    });

    // Record the transaction
    await prisma.transaction.create({
      data: {
        userId,
        signature: paymentSignature,
        amount: plan.priceUsdc,
        token: "USDC",
        tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        type: "SUBSCRIPTION_PAYMENT",
        status: "CONFIRMED",
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
```

## Step 8: Display User's Current Subscription

Show the user their active subscription:

```tsx
// src/components/subscription/CurrentPlan.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { formatDate } from "@/lib/utils";

export function CurrentPlan() {
  const { user } = useUserStore();

  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/subscriptions?userId=${user?.id}`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No active subscription. Choose a plan below!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Current Plan
          <Badge variant={subscription.status === "ACTIVE" ? "default" : "secondary"}>
            {subscription.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-bold">{subscription.plan.name}</p>
        <p className="text-muted-foreground">
          ${subscription.plan.priceUsdc}/{subscription.plan.interval.toLowerCase()}
        </p>
        <p className="text-sm text-muted-foreground">
          Renews on {formatDate(subscription.currentPeriodEnd)}
        </p>
      </CardContent>
    </Card>
  );
}
```

## Complete Flow Summary

Here's the complete user journey:

1. **User connects wallet** → Passkey authentication via Lazorkit
2. **User views plans** → Fetched from `/api/plans`
3. **User clicks "Subscribe"** → Builds USDC transfer instruction
4. **Transaction signed** → Lazorkit handles signing via passkey (GASLESS!)
5. **Transaction sent** → Paymaster sponsors the gas fee
6. **Backend records** → Subscription and transaction saved to database
7. **User sees confirmation** → Active subscription displayed

## Key Benefits of This Architecture

### 1. **Gasless UX**
Users never need SOL for gas fees. The Lazorkit paymaster handles it all.

### 2. **Secure Authentication**
Passkeys are phishing-resistant and tied to the user's device.

### 3. **Real-Time Status**
React Query keeps subscription status synced automatically.

### 4. **Clean Separation**
- Frontend handles UI and Lazorkit integration
- Backend handles data persistence and business logic
- Solana handles payments and verification

## Testing Your Implementation

1. **Connect wallet** with a passkey
2. **Get devnet USDC** from a faucet
3. **Select a plan** and complete payment
4. **Verify transaction** on Solana Explorer
5. **Check subscription** in database

## Next Steps

- Add subscription cancellation flow
- Implement webhook notifications
- Add subscription upgrade/downgrade logic
- Build renewal reminders

---

**Congratulations!** You've built a complete subscription payment system with gasless transactions! 🎉

Continue to [Tutorial 4: Session Persistence](./04-session-persistence.md) to learn how to maintain user sessions across page reloads.
