// =============================================================================
// API: POST /api/subscriptions - Create subscription
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PLAN_INTERVALS } from "@/lib/constants";

interface CreateSubscriptionBody {
  userId?: string;
  walletAddress?: string;
  planId: string;
  paymentSignature?: string;
  transactionSignature?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSubscriptionBody = await request.json();

    // Support both paymentSignature and transactionSignature
    const signature = body.paymentSignature || body.transactionSignature;

    // Validate required fields
    if ((!body.userId && !body.walletAddress) || !body.planId) {
      return NextResponse.json(
        { error: "Missing required fields (userId or walletAddress, planId)" },
        { status: 400 }
      );
    }

    // Get userId - either directly or by looking up wallet address
    let userId = body.userId;
    if (!userId && body.walletAddress) {
      const user = await prisma.user.findUnique({
        where: { walletAddress: body.walletAddress },
      });
      if (!user) {
        // Auto-create user in mock mode or when user doesn't exist
        const newUser = await prisma.user.create({
          data: {
            walletAddress: body.walletAddress,
            credentialId: `mock_${body.walletAddress}`,
            publicKey: `mock_pubkey_${body.walletAddress}`,
          },
        });
        userId = newUser.id;
      } else {
        userId = user.id;
      }
    }

    // Get the plan
    const plan = await prisma.plan.findUnique({
      where: { id: body.planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    // Calculate next billing date based on plan interval
    const now = new Date();
    const intervalMs = PLAN_INTERVALS[plan.interval];
    const nextBilling = new Date(now.getTime() + intervalMs);

    // Cancel any existing active subscriptions for this user
    await prisma.subscription.updateMany({
      where: {
        userId: userId!,
        status: "ACTIVE",
      },
      data: {
        status: "CANCELLED",
        endDate: now,
      },
    });

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: userId!,
        planId: body.planId,
        status: "ACTIVE",
        startDate: now,
        nextBilling,
        lastPaymentAt: now,
      },
      include: {
        plan: true,
      },
    });

    // Format plan features
    const formattedSubscription = {
      ...subscription,
      plan: {
        ...subscription.plan,
        features: JSON.parse(subscription.plan.features),
      },
    };

    return NextResponse.json({ subscription: formattedSubscription });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
