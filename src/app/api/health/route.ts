// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================
// Returns the current health status of the application.
// Useful for monitoring, load balancers, and deployment checks.
// =============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =============================================================================
// TYPES
// =============================================================================

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    solana: ServiceStatus;
  };
  environment: string;
}

interface ServiceStatus {
  status: "up" | "down" | "degraded";
  latency?: number;
  message?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

const startTime = Date.now();

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: "up",
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "down",
      message: error instanceof Error ? error.message : "Database connection failed",
    };
  }
}

async function checkSolana(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getHealth",
      }),
    });
    
    const data = await response.json();
    const latency = Date.now() - start;
    
    if (data.result === "ok") {
      return { status: "up", latency };
    } else {
      return { 
        status: "degraded", 
        latency,
        message: data.error?.message || "RPC health check returned non-ok status"
      };
    }
  } catch (error) {
    return {
      status: "down",
      message: error instanceof Error ? error.message : "Solana RPC connection failed",
    };
  }
}

// =============================================================================
// GET /api/health
// =============================================================================

/**
 * Health Check Endpoint
 * 
 * Returns:
 * - 200 OK: All services healthy
 * - 503 Service Unavailable: One or more services down
 * 
 * @example Response
 * ```json
 * {
 *   "status": "healthy",
 *   "timestamp": "2024-01-07T12:00:00.000Z",
 *   "version": "1.0.0",
 *   "uptime": 3600,
 *   "services": {
 *     "api": { "status": "up" },
 *     "database": { "status": "up", "latency": 5 },
 *     "solana": { "status": "up", "latency": 150 }
 *   },
 *   "environment": "development"
 * }
 * ```
 */
export async function GET() {
  const [databaseStatus, solanaStatus] = await Promise.all([
    checkDatabase(),
    checkSolana(),
  ]);

  const services = {
    api: { status: "up" as const },
    database: databaseStatus,
    solana: solanaStatus,
  };

  // Determine overall status
  const allUp = Object.values(services).every(s => s.status === "up");
  const anyDown = Object.values(services).some(s => s.status === "down");
  
  let overallStatus: HealthStatus["status"];
  if (allUp) {
    overallStatus = "healthy";
  } else if (anyDown) {
    overallStatus = "unhealthy";
  } else {
    overallStatus = "degraded";
  }

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services,
    environment: process.env.NODE_ENV || "development",
  };

  return NextResponse.json(health, {
    status: overallStatus === "unhealthy" ? 503 : 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
