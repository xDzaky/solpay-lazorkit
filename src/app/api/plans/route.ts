// =============================================================================
// API: GET /api/plans
// =============================================================================
// Get all active subscription plans
// =============================================================================

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    // Parse features JSON for each plan
    const formattedPlans = plans.map((plan) => ({
      ...plan,
      features: JSON.parse(plan.features),
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
