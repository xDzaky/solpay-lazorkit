"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Check, Sparkles, Loader2, Crown, PartyPopper } from "lucide-react";
import { useSubscribe } from "@/hooks/useSubscribe";
import { MOCK_MODE, getMockSubscription, getMockBalance } from "@/lib/mock-mode";
import { useRealBalance } from "@/hooks/useRealBalance";
import { formatUsdc } from "@/lib/utils";
import confetti from "canvas-confetti";

/**
 * Subscription plans available for users.
 * Each plan includes pricing, features, and display configuration.
 */
const plans = [
    {
        id: "plan_basic",
        name: "Basic",
        description: "Perfect for individuals just getting started.",
        price: 5.0,
        features: [
            "Up to 10 tx/month",
            "Basic analytics",
            "Email support",
            "1 connected wallet",
        ],
        highlighted: false,
        buttonText: "Subscribe Now",
    },
    {
        id: "plan_pro",
        name: "Pro",
        description: "For professionals who need more power and detailed insights.",
        price: 15.0,
        features: [
            "Unlimited transactions",
            "Advanced analytics",
            "Priority support",
            "5 connected wallets",
            "API Access",
            "Custom webhooks",
        ],
        highlighted: true,
        buttonText: "Subscribe Now",
    },
    {
        id: "plan_enterprise",
        name: "Enterprise",
        description: "For large teams with advanced compliance needs.",
        price: 50.0,
        features: [
            "Everything in Pro",
            "Unlimited connected wallets",
            "Dedicated manager",
            "SLA Guarantee",
            "On-chain analytics",
        ],
        highlighted: false,
        buttonText: "Contact Sales",
    },
];

export function Pricing() {
    const { isConnected } = useWallet();
    const { subscribe, isProcessing, error } = useSubscribe();
    const { usdcBalance } = useRealBalance(); // Now includes swap simulation
    const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);

    // Sync with mock subscription data
    useEffect(() => {
        if (!MOCK_MODE) return;

        const updateData = () => {
            const sub = getMockSubscription();
            setCurrentSubscription(sub?.planId || null);
        };

        updateData();
        const interval = setInterval(updateData, 500);
        return () => clearInterval(interval);
    }, []);

    // Confetti celebration
    const celebrate = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#6366f1', '#8b5cf6', '#10b981']
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#6366f1', '#8b5cf6', '#10b981']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    const handleSubscribe = async (planId: string, planName: string, price: number) => {
        if (!isConnected) {
            alert("Please connect your wallet first!");
            return;
        }

        // Check if already subscribed to this plan
        if (currentSubscription === planId) {
            alert("You are already subscribed to this plan!");
            return;
        }

        // Check balance (usdcBalance is already in dollars, not smallest unit)
        if (usdcBalance < price) {
            alert(`Insufficient balance! You need $${price} but only have $${usdcBalance.toFixed(2)}. Swap some SOL to USDC first!`);
            return;
        }

        setProcessingPlanId(planId);
        setSuccessMessage(null);

        const result = await subscribe(planId, planName, price);

        if (result.success) {
            setSuccessMessage(`Successfully subscribed to ${planName}! Tx: ${result.signature?.slice(0, 8)}...`);
            celebrate(); // 🎉 Confetti!
            setCurrentSubscription(planId);
        }

        setProcessingPlanId(null);
    };

    const handleContactSales = () => {
        window.open("https://t.me/lazorkit", "_blank");
    };

    const isCurrentPlan = (planId: string) => currentSubscription === planId;

    return (
        <section className="relative z-10 py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
                        Choose Your Plan
                    </h2>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        All plans include gasless transactions. Pay only for what you need.
                    </p>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="max-w-md mx-auto mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm text-center">
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white p-8 rounded-2xl border transition-all ${
                                isCurrentPlan(plan.id)
                                    ? "border-emerald-300 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30"
                                    : plan.highlighted
                                    ? "border-indigo-200 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/20 transform md:-translate-y-4 z-10"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            {/* Current Plan Badge */}
                            {isCurrentPlan(plan.id) && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    Current Plan
                                </div>
                            )}
                            
                            {/* Most Popular Badge */}
                            {plan.highlighted && !isCurrentPlan(plan.id) && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
                                    Most Popular
                                </div>
                            )}

                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {plan.name}
                            </h3>
                            <p className="text-slate-500 text-sm mb-6 h-10">
                                {plan.description}
                            </p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-semibold tracking-tight text-slate-900">
                                    ${plan.price.toFixed(2)}
                                </span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-center gap-3 text-sm text-slate-600"
                                    >
                                        <Check
                                            className={`w-4 h-4 ${
                                                isCurrentPlan(plan.id) 
                                                    ? "text-emerald-500" 
                                                    : plan.highlighted 
                                                    ? "text-indigo-500" 
                                                    : "text-emerald-500"
                                                }`}
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {plan.id === "plan_enterprise" ? (
                                <button
                                    onClick={handleContactSales}
                                    className="w-full py-3 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    Contact Sales
                                </button>
                            ) : isCurrentPlan(plan.id) ? (
                                <button
                                    disabled
                                    className="w-full py-3 bg-emerald-100 text-emerald-700 font-medium rounded-lg cursor-default flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Subscribed
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleSubscribe(plan.id, plan.name, plan.price)}
                                    disabled={isProcessing}
                                    className={`w-full py-3 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${plan.highlighted
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-indigo-500/25"
                                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                        }`}
                                >
                                    {processingPlanId === plan.id ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </span>
                                    ) : currentSubscription ? (
                                        "Upgrade Plan"
                                    ) : (
                                        plan.buttonText
                                    )}
                                </button>
                            )}

                            <p className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />{" "}
                                Gasless by Lazorkit
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
