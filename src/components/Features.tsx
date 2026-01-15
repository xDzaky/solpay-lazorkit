"use client";

import { motion } from "framer-motion";
import { Fingerprint, Zap, ShieldCheck, Coins, Send, QrCode, Users, Layers } from "lucide-react";

/**
 * Features Section Component
 * 
 * Displays the key features of SolPay on the landing page:
 * - Passkey Authentication (FaceID/TouchID/Windows Hello)
 * - Gasless Transactions (Paymaster-sponsored)
 * - Secure Design (WebAuthn + on-chain verification)
 * - USDC Payments (Stablecoin billing)
 * - Send Payments, QR Requests, Split Bills
 * 
 * Now with Framer Motion animations for enhanced UX.
 * 
 * @example
 * ```tsx
 * <Features />
 * ```
 */

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
    }
};

const coreFeatures = [
    {
        icon: Fingerprint,
        title: "Passkey Auth",
        description: "Sign in securely with Face ID, Touch ID, or Windows Hello. Forget complex seed phrases.",
        color: "indigo",
        gradient: "from-indigo-500 to-purple-500"
    },
    {
        icon: Zap,
        title: "Gasless Tx",
        description: "Pay only for what you subscribe to. Gas fees are completely sponsored by the paymaster.",
        color: "purple",
        gradient: "from-purple-500 to-pink-500"
    },
    {
        icon: ShieldCheck,
        title: "Secure Design",
        description: "WebAuthn passkeys with on-chain smart wallet verification. Your keys never leave your device.",
        color: "teal",
        gradient: "from-teal-500 to-emerald-500"
    },
    {
        icon: Coins,
        title: "USDC Payments",
        description: "Pay with stable USDC. No volatile token prices or unexpected slippage. Predictable billing.",
        color: "blue",
        gradient: "from-blue-500 to-cyan-500"
    }
];

const uniqueFeatures = [
    {
        icon: Send,
        title: "Instant Send",
        description: "Send USDC to any wallet address instantly with zero gas fees.",
        color: "indigo"
    },
    {
        icon: QrCode,
        title: "QR Payment Requests",
        description: "Generate QR codes for payment requests. Perfect for in-person transactions.",
        color: "purple"
    },
    {
        icon: Users,
        title: "Split Bills",
        description: "Split payments among friends with automatic distribution.",
        color: "teal"
    },
    {
        icon: Layers,
        title: "SPL Memo Protocol",
        description: "Full transaction transparency with on-chain metadata tagging.",
        color: "blue"
    }
];

export function Features() {
    return (
        <section className="relative z-10 py-24 bg-white border-t border-slate-100 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-50 rounded-full filter blur-3xl opacity-50" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-50 rounded-full filter blur-3xl opacity-50" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative">
                {/* Core Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full mb-4">
                        Core Technology
                    </span>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
                        Why SolPay?
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Built on Lazorkit SDK, bringing the simplicity of Web2 UX to the
                        power of Web3 payments.
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
                >
                    {coreFeatures.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={cardVariants}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="group p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300"
                        >
                            <motion.div
                                className={`h-12 w-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <feature.icon className="w-6 h-6" />
                            </motion.div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Unique Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-full mb-4">
                        Unique to SolPay
                    </span>
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-4">
                        Features You Won&apos;t Find Elsewhere
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Beyond subscriptions — complete payment ecosystem for everyday use.
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {uniqueFeatures.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            variants={cardVariants}
                            whileHover={{ scale: 1.03 }}
                            className="group relative p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 overflow-hidden"
                        >
                            {/* Animated background shimmer */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.8 }}
                            />
                            
                            <div className="relative">
                                <div className={`h-10 w-10 bg-${feature.color}-50 rounded-lg border border-${feature.color}-100 flex items-center justify-center text-${feature.color}-600 mb-4`}>
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
