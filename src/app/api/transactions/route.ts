// =============================================================================
// API: POST /api/transactions - Record transaction
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface CreateTransactionBody {
  userId: string;
  subscriptionId?: string;
  signature: string;
  amount: number;
  token: string;
  tokenMint: string;
  recipient: string;
  type: "SUBSCRIPTION_PAYMENT" | "ONE_TIME_PAYMENT" | "REFUND";
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTransactionBody = await request.json();

    // Validate required fields
    if (!body.userId || !body.signature || !body.amount || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: body.userId,
        subscriptionId: body.subscriptionId,
        signature: body.signature,
        amount: body.amount,
        token: body.token || "USDC",
        tokenMint: body.tokenMint,
        recipient: body.recipient,
        type: body.type,
        status: "PENDING", // Will be updated when confirmed
      },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    
    // Handle duplicate signature error
    if ((error as any)?.code === "P2002") {
      return NextResponse.json(
        { error: "Transaction already recorded" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
