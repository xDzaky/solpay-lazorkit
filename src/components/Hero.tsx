"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { motion } from "framer-motion";
import { Zap, CreditCard, Sparkles, Send, QrCode, Users, ArrowRight } from "lucide-react";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { MOCK_MODE, getMockBalance } from "@/lib/mock-mode";
import { formatUsdc } from "@/lib/utils";
import Link from "next/link";

/**
 * Hero Section Component
 * 
 * Main landing page hero with:
 * - Headline and value proposition
 * - Interactive wallet widget showing connection status
 * - Live balance display (mock or real)
 * - Connect wallet CTA using Lazorkit SDK
 * - Animated feature highlights
 * 
 * Uses MOCK_MODE to display simulated balance for testing.
 * 
 * @example
 * ```tsx
 * <Hero />
 * ```
 */

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
};

const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
    }
};

export function Hero() {
    const { smartWalletPubkey, isConnected, isConnecting } = useWallet();
    const [balance, setBalance] = useState(0);
    const [mounted, setMounted] = useState(false);

    // Sync balance
    useEffect(() => {
        setMounted(true);
        if (!MOCK_MODE) return;

        const updateBalance = () => {
            setBalance(getMockBalance());
        };

        updateBalance();
        const interval = setInterval(updateBalance, 500);
        return () => clearInterval(interval);
    }, []);

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    const displayBalance = mounted && MOCK_MODE ? formatUsdc(balance) : "$0.00";

    // Quick feature highlights
    const quickFeatures = [
        { icon: Send, label: "Send Payments", color: "indigo" },
        { icon: QrCode, label: "QR Requests", color: "purple" },
        { icon: Users, label: "Split Bills", color: "teal" },
    ];

    return (
        <main className="relative z-10 pt-20 pb-32 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                    animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-20 left-1/3 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                    animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="max-w-4xl mx-auto px-6 text-center relative">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-8"
                >
                    <motion.span
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                        <Zap className="w-3 h-3 fill-indigo-700" />
                    </motion.span>
                    <span>Powered by Lazorkit SDK v2</span>
                </motion.div>

                <motion.h1
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 mb-6 leading-[1.1]"
                >
                    Subscription Payments <br className="hidden md:block" />
                    <motion.span
                        className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-teal-400"
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                        style={{ backgroundSize: "200% 200%" }}
                    >
                        Without Seed Phrases
                    </motion.span>
                </motion.h1>

                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed"
                >
                    Pay for subscriptions with USDC on Solana. Authenticate securely with
                    Face ID or Touch ID. No wallet extensions needed. Gasless
                    transactions.
                </motion.p>

                {/* Quick Feature Pills */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {quickFeatures.map((feature, index) => (
                        <motion.div
                            key={feature.label}
                            variants={scaleIn}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${feature.color}-50 border border-${feature.color}-100 text-${feature.color}-700 text-sm font-medium cursor-default`}
                        >
                            <feature.icon className="w-4 h-4" />
                            <span>{feature.label}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Interactive Widget */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={scaleIn}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="max-w-sm mx-auto"
                >
                    <motion.div
                        animate={floatingAnimation}
                        className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden"
                    >
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <motion.span
                                    className={`flex h-1.5 w-1.5 rounded-full ${isConnected
                                            ? "bg-emerald-500"
                                            : "bg-slate-300"
                                        }`}
                                    animate={isConnected ? {
                                        boxShadow: ["0 0 0px rgba(16,185,129,0.5)", "0 0 12px rgba(16,185,129,0.8)", "0 0 0px rgba(16,185,129,0.5)"]
                                    } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span>{isConnected ? "Wallet Connected" : "Wallet Disconnected"}</span>
                            </div>
                            <span className="font-mono opacity-70">
                                {smartWalletPubkey
                                    ? formatAddress(smartWalletPubkey.toString())
                                    : "---"}
                            </span>
                        </div>
                        <div className="p-8 flex items-end justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium mb-1">
                                    USDC Balance
                                    {MOCK_MODE && mounted && (
                                        <span className="ml-1 text-yellow-500 text-[10px]">(Mock)</span>
                                    )}
                                </p>
                                <motion.p
                                    className="text-3xl font-semibold text-slate-900 tracking-tight"
                                    key={displayBalance}
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isConnected ? displayBalance : "$0.00"}
                                </motion.p>
                            </div>
                            <motion.div
                                className="h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-500"
                                whileHover={{ rotate: 15 }}
                            >
                                {isConnected ? (
                                    <Sparkles className="w-5 h-5" />
                                ) : (
                                    <CreditCard className="w-5 h-5" />
                                )}
                            </motion.div>
                        </div>

                        {/* Connect Button or Dashboard Link */}
                        <div className="px-8 pb-8">
                            {!isConnected ? (
                                <ConnectButton size="default" showAddress={false} className="w-full" />
                            ) : (
                                <Link href="/dashboard">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-shadow"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </main>
    );
}
