"use client";

import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { useSubscribe } from "@/hooks/useSubscribe";

const plans = [
    {
        id: "basic",
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
        id: "pro",
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
        id: "enterprise",
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
    const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubscribe = async (planId: string, planName: string, price: number) => {
        if (!isConnected) {
            alert("Please connect your wallet first!");
            return;
        }

        setProcessingPlanId(planId);
        setSuccessMessage(null);

        const result = await subscribe(planId, planName, price);

        if (result.success) {
            setSuccessMessage(`Successfully subscribed to ${planName}! Tx: ${result.signature?.slice(0, 8)}...`);
        }

        setProcessingPlanId(null);
    };

    const handleContactSales = () => {
        window.open("https://t.me/lazorkit", "_blank");
    };

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
                            className={`relative bg-white p-8 rounded-2xl border transition-all ${plan.highlighted
                                    ? "border-indigo-200 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/20 transform md:-translate-y-4 z-10"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            {plan.highlighted && (
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
                                            className={`w-4 h-4 ${plan.highlighted ? "text-indigo-500" : "text-emerald-500"
                                                }`}
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {plan.id === "enterprise" ? (
                                <button
                                    onClick={handleContactSales}
                                    className="w-full py-3 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    Contact Sales
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
