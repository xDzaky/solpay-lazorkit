// =============================================================================
// API: GET /api/subscriptions/user/[walletAddress]
// =============================================================================
// Get all subscriptions for a user
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = params;

    // Find user first
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    // Format plan features
    const formattedSubscriptions = subscriptions.map((sub) => ({
      ...sub,
      plan: {
        ...sub.plan,
        features: JSON.parse(sub.plan.features),
      },
    }));

    return NextResponse.json({ subscriptions: formattedSubscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
