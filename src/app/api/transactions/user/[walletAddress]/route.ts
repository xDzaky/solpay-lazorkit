// =============================================================================
// API: GET /api/transactions/user/[walletAddress]
// =============================================================================
// Get all transactions for a user
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = params;
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

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

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      transactions,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
