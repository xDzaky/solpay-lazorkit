// =============================================================================
// API: POST /api/users - Create or update user
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface CreateUserBody {
  walletAddress: string;
  credentialId: string;
  publicKey: string;
  platform?: string;
  accountName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserBody = await request.json();

    // Validate required fields
    if (!body.walletAddress || !body.credentialId || !body.publicKey) {
      return NextResponse.json(
        { error: "Missing required fields: walletAddress, credentialId, publicKey" },
        { status: 400 }
      );
    }

    // Upsert user (create if not exists, update if exists)
    const user = await prisma.user.upsert({
      where: { walletAddress: body.walletAddress },
      update: {
        lastLoginAt: new Date(),
        platform: body.platform,
        accountName: body.accountName,
      },
      create: {
        walletAddress: body.walletAddress,
        credentialId: body.credentialId,
        publicKey: body.publicKey,
        platform: body.platform,
        accountName: body.accountName,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { error: "Failed to create/update user" },
      { status: 500 }
    );
  }
}
