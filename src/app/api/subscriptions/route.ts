// =============================================================================
// API: POST /api/subscriptions - Create subscription
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PLAN_INTERVALS } from "@/lib/constants";

interface CreateSubscriptionBody {
  userId: string;
  planId: string;
  paymentSignature: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSubscriptionBody = await request.json();

    // Validate required fields
    if (!body.userId || !body.planId || !body.paymentSignature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: body.userId,
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
