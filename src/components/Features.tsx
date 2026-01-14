"use client";

import { Fingerprint, Zap, ShieldCheck, Coins } from "lucide-react";

/**
 * Features Section Component
 * 
 * Displays the key features of SolPay on the landing page:
 * - Passkey Authentication (FaceID/TouchID/Windows Hello)
 * - Gasless Transactions (Paymaster-sponsored)
 * - Secure Design (WebAuthn + on-chain verification)
 * - USDC Payments (Stablecoin billing)
 * 
 * @example
 * ```tsx
 * <Features />
 * ```
 */
export function Features() {
    return (
        <section className="relative z-10 py-24 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
                        Why SolPay?
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Built on Lazorkit SDK, bringing the simplicity of Web2 UX to the
                        power of Web3 payments.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <div className="group p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300">
                        <div className="h-12 w-12 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                            <Fingerprint className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Passkey Auth
                        </h3>
                        <p className="text-slate-500 leading-relaxed text-sm">
                            Sign in securely with Face ID, Touch ID, or Windows Hello. Forget
                            complex seed phrases.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="group p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300">
                        <div className="h-12 w-12 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Gasless Tx
                        </h3>
                        <p className="text-slate-500 leading-relaxed text-sm">
                            Pay only for what you subscribe to. Gas fees are completely
                            sponsored by the paymaster.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="group p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300">
                        <div className="h-12 w-12 bg-teal-50 rounded-xl border border-teal-100 flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Secure Design
                        </h3>
                        <p className="text-slate-500 leading-relaxed text-sm">
                            WebAuthn passkeys with on-chain smart wallet verification. Your
                            keys never leave your device.
                        </p>
                    </div>

                    {/* Card 4 */}
                    <div className="group p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300">
                        <div className="h-12 w-12 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                            <Coins className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            USDC Payments
                        </h3>
                        <p className="text-slate-500 leading-relaxed text-sm">
                            Pay with stable USDC. No volatile token prices or unexpected
                            slippage. Predictable billing.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
