// =============================================================================
// HOME PAGE
// =============================================================================
// Landing page with hero section and subscription plans.
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { ConnectButton } from "@/components/wallet";
import { PlanGrid, type Plan } from "@/components/subscription";
import { TransactionList } from "@/components/transaction";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlans, getUserTransactions, type Transaction } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import { getUsdcBalance } from "@/lib/solana";
import { formatUsdc } from "@/lib/utils";
import { 
  Fingerprint, 
  Zap, 
  Shield, 
  CreditCard,
  Wallet,
  RefreshCw
} from "lucide-react";

// =============================================================================
// STATIC DATA (would come from API in production)
// =============================================================================

const DEMO_PLANS: Plan[] = [
  {
    id: "plan_basic",
    name: "Basic",
    description: "Perfect for individuals getting started",
    priceUsdc: 5_000_000,
    interval: "MONTHLY",
    features: [
      "Up to 10 transactions/month",
      "Basic analytics dashboard",
      "Email support",
      "1 connected wallet",
    ],
    badge: null,
    isHighlighted: false,
  },
  {
    id: "plan_pro",
    name: "Pro",
    description: "For professionals who need more power",
    priceUsdc: 15_000_000,
    interval: "MONTHLY",
    features: [
      "Unlimited transactions",
      "Advanced analytics & reports",
      "Priority support",
      "5 connected wallets",
      "API access",
      "Custom webhooks",
    ],
    badge: "Most Popular",
    isHighlighted: true,
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    description: "For teams with advanced needs",
    priceUsdc: 50_000_000,
    interval: "MONTHLY",
    features: [
      "Everything in Pro",
      "Unlimited connected wallets",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "On-chain analytics",
    ],
    badge: "Best for Teams",
    isHighlighted: false,
  },
];

// =============================================================================
// FEATURES DATA
// =============================================================================

const FEATURES = [
  {
    icon: Fingerprint,
    title: "Passkey Authentication",
    description:
      "Sign in with Face ID, Touch ID, or Windows Hello. No seed phrases to remember.",
  },
  {
    icon: Zap,
    title: "Gasless Transactions",
    description:
      "Pay only for what you subscribe to. Gas fees are sponsored by paymaster.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description:
      "WebAuthn passkeys with on-chain smart wallet verification. Your keys never leave your device.",
  },
  {
    icon: CreditCard,
    title: "USDC Payments",
    description:
      "Pay with stable USDC. No volatile token prices. Predictable billing.",
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function HomePage() {
  // ─────────────────────────────────────────────────────────────────────────
  // Hooks
  // ─────────────────────────────────────────────────────────────────────────
  const { isConnected, smartWalletPubkey } = useWallet();
  const { user } = useUserStore();

  // ─────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────
  const [plans, setPlans] = useState<Plan[]>(DEMO_PLANS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────

  // Fetch USDC balance when connected
  useEffect(() => {
    if (isConnected && smartWalletPubkey) {
      setIsLoadingBalance(true);
      getUsdcBalance(smartWalletPubkey.toString())
        .then(setBalance)
        .catch(console.error)
        .finally(() => setIsLoadingBalance(false));
    } else {
      setBalance(null);
    }
  }, [isConnected, smartWalletPubkey]);

  // Fetch transactions when user is available
  useEffect(() => {
    if (user?.walletAddress) {
      getUserTransactions(user.walletAddress)
        .then((res) => setTransactions(res.transactions))
        .catch(console.error);
    }
  }, [user?.walletAddress]);

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubscribe = (plan: Plan, signature: string) => {
    console.log("Subscribed to", plan.name, "with signature", signature);
    // Refresh transactions
    if (user?.walletAddress) {
      getUserTransactions(user.walletAddress)
        .then((res) => setTransactions(res.transactions))
        .catch(console.error);
    }
    // Refresh balance
    if (smartWalletPubkey) {
      getUsdcBalance(smartWalletPubkey.toString())
        .then(setBalance)
        .catch(console.error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen">
      {/* ─────────────────────────────────────────────────────────────────────
          HEADER
      ───────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between max-w-7xl">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-solana-purple to-solana-green flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">SolPay</span>
            <Badge variant="secondary" className="text-xs">
              Devnet
            </Badge>
          </div>

          {/* Connect Button */}
          <ConnectButton />
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────
          HERO SECTION
      ───────────────────────────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-32 gradient-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="solana" className="mb-4">
              🚀 Powered by Lazorkit
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Subscription Payments{" "}
              <span className="gradient-text">Without Seed Phrases</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Pay for subscriptions with USDC on Solana. Authenticate with Face ID
              or Touch ID. No wallet extensions needed. Gasless transactions.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ConnectButton size="lg" />
            </div>

            {/* Balance Display */}
            {isConnected && (
              <Card className="mt-8 max-w-sm mx-auto">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">USDC Balance</span>
                    {isLoadingBalance ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="font-bold text-lg">
                        {balance !== null ? formatUsdc(balance) : "—"}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          FEATURES SECTION
      ───────────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why SolPay?</h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Built on Lazorkit SDK, SolPay brings the best of Web2 UX to Web3
              payments.
            </p>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="card-hover">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          PRICING SECTION
      ───────────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-muted-foreground text-base md:text-lg">
              All plans include gasless transactions. Pay only for what you need.
            </p>
          </div>

          <div className="flex justify-center">
            <PlanGrid plans={plans} onSubscribe={handleSubscribe} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          TRANSACTIONS SECTION (only shown when connected)
      ───────────────────────────────────────────────────────────────────── */}
      {isConnected && (
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <TransactionList transactions={transactions} />
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────────────────────────────── */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-solana-purple to-solana-green flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">SolPay</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Built with{" "}
              <a
                href="https://lazorkit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Lazorkit SDK
              </a>{" "}
              for the Lazorkit Bounty 2026
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a
                href="https://github.com/lazor-kit/lazor-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                GitHub
              </a>
              <a
                href="https://docs.lazorkit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Docs
              </a>
              <a
                href="https://t.me/lazorkit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Telegram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
