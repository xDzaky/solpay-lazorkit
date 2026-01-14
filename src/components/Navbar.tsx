"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@lazorkit/wallet";
import { Wallet, Copy, ExternalLink, LogOut, Check } from "lucide-react";
import { getExplorerUrl } from "@/lib/constants";

/**
 * Navigation Bar Component
 * 
 * Displays the main navigation with:
 * - SolPay logo and branding
 * - Navigation links (About, Docs)
 * - Wallet connection status
 * - Address display with copy functionality
 * - Disconnect button
 * 
 * Shows different UI based on wallet connection state.
 * 
 * @example
 * ```tsx
 * <Navbar />
 * ```
 */
export function Navbar() {
    const { smartWalletPubkey, isConnected, disconnect } = useWallet();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!smartWalletPubkey) return;
        try {
            await navigator.clipboard.writeText(smartWalletPubkey.toString());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnect();
        } catch (err) {
            console.error("Disconnect error:", err);
        }
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    return (
        <nav className="relative z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-lg flex items-center justify-center text-white shadow-sm">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-lg tracking-tight">SolPay</span>
                        <span className="bg-slate-100 text-slate-500 text-xs font-medium px-2 py-0.5 rounded-full border border-slate-200">
                            Devnet
                        </span>
                    </Link>
                    
                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link 
                            href="/about" 
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            About
                        </Link>
                        <Link 
                            href="/docs" 
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Docs
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isConnected && smartWalletPubkey ? (
                        <>
                            <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm text-sm text-slate-600">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                <span className="font-medium text-xs">Connected</span>
                                <span className="w-px h-3 bg-slate-200 mx-1"></span>
                                <span className="font-mono text-xs">
                                    {formatAddress(smartWalletPubkey.toString())}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                    title="Copy address"
                                >
                                    {copied ? (
                                        <Check className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                        <Copy className="w-3 h-3" />
                                    )}
                                </button>
                                <a
                                    href={getExplorerUrl("address", smartWalletPubkey.toString())}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                    title="View on Explorer"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <button
                                onClick={handleDisconnect}
                                className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
                                title="Disconnect"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <span className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                            <span className="flex h-2 w-2 rounded-full bg-slate-300"></span>
                            Not Connected
                        </span>
                    )}
                </div>
            </div>
        </nav>
    );
}
