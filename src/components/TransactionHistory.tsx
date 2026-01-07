"use client";

import { FileSearch } from "lucide-react";

export function TransactionHistory() {
    return (
        <section className="relative z-10 py-16 bg-slate-50 border-t border-slate-200">
            <div className="max-w-4xl mx-auto px-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    Transaction History
                </h3>

                <div className="bg-white rounded-xl border border-slate-200 min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileSearch className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-slate-900 font-medium mb-1">
                        No transactions yet
                    </h4>
                    <p className="text-slate-500 text-sm">
                        Subscribe to a plan above to see your first on-chain transaction!
                    </p>
                </div>
            </div>
        </section>
    );
}
