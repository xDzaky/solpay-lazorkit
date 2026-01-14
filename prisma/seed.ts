// =============================================================================
// PRISMA SEED FILE
// =============================================================================
// This file populates the database with initial data for development/testing.
// Run with: npm run db:seed
// =============================================================================

import { PrismaClient, PlanInterval } from "@prisma/client";

const prisma = new PrismaClient();

// =============================================================================
// SEED DATA
// =============================================================================

const plans = [
  {
    id: "plan_basic",
    name: "Basic",
    description: "Perfect for individuals getting started with crypto payments",
    priceUsdc: 5_000_000, // 5 USDC
    interval: PlanInterval.MONTHLY,
    features: JSON.stringify([
      "Up to 10 transactions/month",
      "Basic analytics dashboard",
      "Email support",
      "1 connected wallet",
    ]),
    isActive: true,
    sortOrder: 1,
    badge: null,
    isHighlighted: false,
  },
  {
    id: "plan_pro",
    name: "Pro",
    description: "For professionals who need more power and flexibility",
    priceUsdc: 15_000_000, // 15 USDC
    interval: PlanInterval.MONTHLY,
    features: JSON.stringify([
      "Unlimited transactions",
      "Advanced analytics & reports",
      "Priority support",
      "5 connected wallets",
      "API access",
      "Custom webhooks",
    ]),
    isActive: true,
    sortOrder: 2,
    badge: "Most Popular",
    isHighlighted: true,
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    description: "For teams and businesses with advanced needs",
    priceUsdc: 50_000_000, // 50 USDC
    interval: PlanInterval.MONTHLY,
    features: JSON.stringify([
      "Everything in Pro",
      "Unlimited connected wallets",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "On-chain analytics",
      "White-label options",
    ]),
    isActive: true,
    sortOrder: 3,
    badge: "Best for Teams",
    isHighlighted: false,
  },
  {
    id: "plan_yearly",
    name: "Pro Annual",
    description: "Pro plan with 2 months free when you pay yearly",
    priceUsdc: 150_000_000, // 150 USDC (12 months, 2 free)
    interval: PlanInterval.YEARLY,
    features: JSON.stringify([
      "All Pro features",
      "2 months free",
      "Price locked for 12 months",
      "Priority onboarding",
    ]),
    isActive: true,
    sortOrder: 4,
    badge: "Save 17%",
    isHighlighted: false,
  },
];

// =============================================================================
// SEED FUNCTION
// =============================================================================

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data (in development only!)
  console.log("🗑️  Clearing existing plans...");
  await prisma.plan.deleteMany();

  // Seed plans
  console.log("📦 Creating subscription plans...");
  for (const plan of plans) {
    const created = await prisma.plan.create({
      data: plan,
    });
    console.log(`   ✓ Created plan: ${created.name} ($${created.priceUsdc / 1_000_000} USDC/${created.interval.toLowerCase()})`);
  }

  console.log("\n✅ Seed completed successfully!");
  console.log(`   Total plans created: ${plans.length}`);
}

// =============================================================================
// RUN SEED
// =============================================================================

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
