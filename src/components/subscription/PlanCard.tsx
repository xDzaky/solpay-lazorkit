// =============================================================================
// PLAN CARD COMPONENT
// =============================================================================
// Displays a subscription plan with pricing and features.
// =============================================================================

"use client";

import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatUsdc, getErrorMessage } from "@/lib/utils";
import { buildSubscriptionPaymentInstruction } from "@/lib/solana";
import { createSubscription, createTransaction } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import { TOKENS, VAULT_ADDRESS } from "@/lib/constants";
import { Check, Loader2, Sparkles } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceUsdc: number;
  interval: "WEEKLY" | "MONTHLY" | "YEARLY";
  features: string[];
  badge: string | null;
  isHighlighted: boolean;
}

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSubscribe?: (plan: Plan, signature: string) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * PlanCard
 * 
 * Displays a subscription plan with:
 * - Plan name and description
 * - Pricing in USDC
 * - Feature list
 * - Subscribe button that triggers gasless USDC payment
 * 
 * @example
 * ```tsx
 * <PlanCard 
 *   plan={proplan}
 *   onSubscribe={(plan, sig) => console.log('Subscribed!', sig)}
 * />
 * ```
 */
export function PlanCard({ plan, isCurrentPlan = false, onSubscribe }: PlanCardProps) {
  // ─────────────────────────────────────────────────────────────────────────
  // Hooks
  // ─────────────────────────────────────────────────────────────────────────
  const { isConnected, smartWalletPubkey, signAndSendTransaction } = useWallet();
  const { user } = useUserStore();

  // ─────────────────────────────────────────────────────────────────────────
  // Local State
  // ─────────────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────────────────────
  const priceDisplay = formatUsdc(plan.priceUsdc);
  const intervalDisplay = plan.interval.toLowerCase();

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Handle subscription purchase
   * 
   * Flow:
   * 1. Build USDC transfer instruction
   * 2. Sign and send via Lazorkit (gasless)
   * 3. Record transaction in database
   * 4. Create subscription record
   */
  const handleSubscribe = async () => {
    if (!isConnected || !smartWalletPubkey || !user) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Build USDC transfer instructions
      const instructions = await buildSubscriptionPaymentInstruction(
        smartWalletPubkey.toString(),
        plan.priceUsdc
      );

      // Step 2: Sign and send transaction via Lazorkit
      // This is GASLESS - the paymaster sponsors the transaction fee!
      const signature = await signAndSendTransaction({
        instructions,
        transactionOptions: {
          // Use USDC for any additional fees (optional)
          // feeToken: TOKENS.USDC.mint,
        },
      });

      console.log("Transaction signature:", signature);

      // Step 3: Record transaction in database
      await createTransaction({
        userId: user.id,
        signature,
        amount: plan.priceUsdc,
        token: TOKENS.USDC.symbol,
        tokenMint: TOKENS.USDC.mint,
        recipient: VAULT_ADDRESS,
        type: "SUBSCRIPTION_PAYMENT",
      });

      // Step 4: Create subscription record
      await createSubscription({
        userId: user.id,
        planId: plan.id,
        paymentSignature: signature,
      });

      // Notify parent component
      onSubscribe?.(plan, signature);
    } catch (err) {
      console.error("Subscription error:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all duration-300",
        plan.isHighlighted &&
          "border-2 border-solana-purple shadow-lg shadow-solana-purple/10 scale-105",
        isCurrentPlan && "ring-2 ring-green-500"
      )}
    >
      {/* Highlight Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="solana" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {plan.badge}
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="success">Current Plan</Badge>
        </div>
      )}

      <CardHeader className={cn(plan.badge && "pt-8")}>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price */}
        <div className="mb-6">
          <span className="text-4xl font-bold">{priceDisplay}</span>
          <span className="text-muted-foreground">/{intervalDisplay}</span>
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {/* Subscribe Button */}
        <Button
          className="w-full"
          size="lg"
          variant={plan.isHighlighted ? "solana" : "default"}
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan || !isConnected}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : !isConnected ? (
            "Connect Wallet to Subscribe"
          ) : (
            "Subscribe Now"
          )}
        </Button>

        {/* Gasless Badge */}
        {!isCurrentPlan && isConnected && (
          <p className="text-xs text-muted-foreground text-center">
            ✨ Gasless transaction powered by Lazorkit
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </CardFooter>
    </Card>
  );
}

export default PlanCard;
