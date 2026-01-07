// =============================================================================
// PRISMA CLIENT - Database Connection
// =============================================================================
// Singleton Prisma client instance for Next.js
// Prevents multiple instances in development due to hot reloading
// =============================================================================

import { PrismaClient } from "@prisma/client";

// Declare global type for prisma client
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a single instance of Prisma Client
export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// In development, attach to global object to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
