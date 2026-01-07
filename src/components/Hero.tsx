"use client";

import { useWallet } from "@lazorkit/wallet";
import { Zap, CreditCard, Fingerprint } from "lucide-react";
import { ConnectButton } from "@/components/wallet/ConnectButton";

export function Hero() {
    const { smartWalletPubkey, isConnected, isConnecting } = useWallet();

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    return (
        <main className="relative z-10 pt-20 pb-32">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-8">
                    <Zap className="w-3 h-3 fill-indigo-700" />
                    <span>Powered by Lazorkit</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                    Subscription Payments <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-teal-400">
                        Without Seed Phrases
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Pay for subscriptions with USDC on Solana. Authenticate securely with
                    Face ID or Touch ID. No wallet extensions needed. Gasless
                    transactions.
                </p>

                {/* Interactive Widget */}
                <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden transform transition-all hover:scale-[1.01]">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <span
                                className={`flex h-1.5 w-1.5 rounded-full ${isConnected
                                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                        : "bg-slate-300"
                                    }`}
                            ></span>
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
                            </p>
                            <p className="text-3xl font-semibold text-slate-900 tracking-tight">
                                $0.00
                            </p>
                        </div>
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Connect Button if not connected */}
                    {!isConnected && (
                        <div className="px-8 pb-8">
                            <ConnectButton size="default" showAddress={false} className="w-full" />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
