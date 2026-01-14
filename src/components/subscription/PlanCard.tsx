// =============================================================================
// PLAN CARD COMPONENT
// =============================================================================
// Displays a subscription plan with pricing and features.
// Supports mock mode for testing without real USDC.
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
import { useBalance, useInvalidateBalance } from "@/hooks";
import { 
  MOCK_MODE, 
  simulateDelay, 
  logMockActivity,
  addMockTransaction,
  deductMockBalance,
  getMockBalance,
  setMockSubscription
} from "@/lib/mock-mode";
import { Check, Loader2, Sparkles, Wallet, AlertCircle } from "lucide-react";

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
  const { balance, formattedBalance, refetch: refetchBalance } = useBalance(
    smartWalletPubkey?.toString()
  );
  const invalidateBalance = useInvalidateBalance();

  // ─────────────────────────────────────────────────────────────────────────
  // Local State
  // ─────────────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────────────────────
  const priceDisplay = formatUsdc(plan.priceUsdc);
  const intervalDisplay = plan.interval.toLowerCase();
  const hasEnoughBalance = balance !== undefined && balance >= plan.priceUsdc;

  // ─────────────────────────────────────────────────────────────────────────
  // Generate mock signature helper
  // ─────────────────────────────────────────────────────────────────────────
  const generateMockSignature = (): string => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Handle subscription purchase
   * 
   * Flow:
   * 1. Build USDC transfer instruction (or simulate in mock mode)
   * 2. Sign and send via Lazorkit (gasless)
   * 3. Record transaction in database
   * 4. Create subscription record
   */
  const handleSubscribe = async () => {
    if (!isConnected || !smartWalletPubkey || !user) {
      setError("Please connect your wallet first");
      return;
    }

    // Check balance
    if (!hasEnoughBalance && !MOCK_MODE) {
      setError(`Insufficient balance. You need ${priceDisplay} USDC.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let signature: string;

      // ─────────────────────────────────────────────────────────────────────
      // MOCK MODE: Simulate transaction
      // ─────────────────────────────────────────────────────────────────────
      if (MOCK_MODE) {
        logMockActivity("Processing mock subscription", { plan: plan.name });
        
        // Check mock balance
        const currentBalance = getMockBalance();
        if (currentBalance < plan.priceUsdc) {
          throw new Error(`Insufficient USDC. Need ${formatUsdc(plan.priceUsdc)}, have ${formatUsdc(currentBalance)}`);
        }
        
        // Simulate network delay
        await simulateDelay(2000);
        
        // Generate mock signature
        signature = generateMockSignature();
        
        // Deduct mock balance
        deductMockBalance(plan.priceUsdc);
        
        // Record mock transaction
        addMockTransaction({
          from: smartWalletPubkey.toString(),
          to: VAULT_ADDRESS,
          amount: plan.priceUsdc,
          token: "USDC",
          planId: plan.id,
          planName: plan.name,
          type: "SUBSCRIPTION_PAYMENT",
        });
        
        // Set mock subscription
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
        
        setMockSubscription({
          id: `sub_mock_${Date.now()}`,
          planId: plan.id,
          planName: plan.name,
          priceUsdc: plan.priceUsdc,
          status: "ACTIVE",
          startDate: now,
          endDate,
          transactionSignature: signature,
        });
        
        logMockActivity("Mock subscription complete", { signature, newBalance: getMockBalance() });
      } else {
        // ─────────────────────────────────────────────────────────────────────
        // LIVE MODE: Real blockchain transaction
        // ─────────────────────────────────────────────────────────────────────
        
        // Step 1: Build USDC transfer instructions
        const instructions = await buildSubscriptionPaymentInstruction(
          smartWalletPubkey.toString(),
          plan.priceUsdc
        );

        // Step 2: Sign and send transaction via Lazorkit
        // This is GASLESS - the paymaster sponsors the transaction fee!
        signature = await signAndSendTransaction({
          instructions,
          transactionOptions: {
            // Use USDC for any additional fees (optional)
            // feeToken: TOKENS.USDC.mint,
          },
        });
      }

      console.log("Transaction signature:", signature);

      // Step 3: Record transaction in database
      try {
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
      } catch (dbError) {
        // In mock mode, database errors are non-fatal
        if (MOCK_MODE) {
          console.warn("Mock mode: Database recording skipped", dbError);
        } else {
          throw dbError;
        }
      }

      // Refresh balance
      invalidateBalance();
      refetchBalance();
      
      // Show success state
      setSuccess(true);

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
        {/* Balance Display (only when connected) */}
        {isConnected && (
          <div className="w-full flex items-center justify-between text-sm mb-2 p-2 rounded-md bg-muted/50">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              Your Balance:
            </span>
            <span className={cn(
              "font-semibold",
              hasEnoughBalance ? "text-green-500" : "text-yellow-500"
            )}>
              ${formattedBalance} USDC
              {MOCK_MODE && <span className="text-xs ml-1">(Mock)</span>}
            </span>
          </div>
        )}

        {/* Subscribe Button */}
        <Button
          className="w-full"
          size="lg"
          variant={success ? "success" : plan.isHighlighted ? "solana" : "default"}
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan || !isConnected || success}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : success ? (
            <>
              <Check className="w-4 h-4" />
              Subscribed Successfully!
            </>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : !isConnected ? (
            "Connect Wallet to Subscribe"
          ) : !hasEnoughBalance && !MOCK_MODE ? (
            "Insufficient Balance"
          ) : (
            "Subscribe Now"
          )}
        </Button>

        {/* Mock Mode / Gasless Badge */}
        {!isCurrentPlan && isConnected && !success && (
          <p className="text-xs text-muted-foreground text-center">
            {MOCK_MODE ? (
              "🧪 Mock Mode - No real tokens used"
            ) : (
              "✨ Gasless transaction powered by Lazorkit"
            )}
          </p>
        )}

        {/* Insufficient Balance Warning */}
        {isConnected && !hasEnoughBalance && !MOCK_MODE && !success && (
          <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="w-3 h-3" />
            Need {formatUsdc(plan.priceUsdc - (balance || 0))} more USDC
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        
        {/* Success Message */}
        {success && (
          <p className="text-sm text-green-600 dark:text-green-400 text-center">
            🎉 Welcome to {plan.name}! Check your dashboard for details.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

export default PlanCard;
