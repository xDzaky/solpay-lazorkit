"use client";

import { Wallet } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative z-10 border-t border-slate-200 bg-white py-12">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-md flex items-center justify-center text-white">
                        <Wallet className="w-3 h-3" />
                    </div>
                    <span className="font-semibold text-slate-900">SolPay</span>
                </div>

                <p className="text-slate-500 text-sm text-center md:text-left">
                    Built with{" "}
                    <a
                        href="https://docs.lazorkit.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                    >
                        Lazorkit SDK
                    </a>{" "}
                    for the Lazorkit Bounty 2026.
                </p>

                <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                    <a
                        href="https://github.com/lazor-kit/lazor-kit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-900 transition-colors"
                    >
                        GitHub
                    </a>
                    <a
                        href="https://docs.lazorkit.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-900 transition-colors"
                    >
                        Docs
                    </a>
                    <a
                        href="https://t.me/lazorkit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-900 transition-colors"
                    >
                        Telegram
                    </a>
                </div>
            </div>
        </footer>
    );
}
