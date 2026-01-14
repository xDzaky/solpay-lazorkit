"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { FileSearch, Beaker } from "lucide-react";
import { TransactionList } from "@/components/transaction/TransactionList";
import { MOCK_MODE, getMockTransactions, type MockTransaction } from "@/lib/mock-mode";

export function TransactionHistory() {
    const { isConnected, smartWalletPubkey } = useWallet();
    const [mockTransactions, setMockTransactions] = useState<MockTransaction[]>([]);

    // Poll for mock transactions
    useEffect(() => {
        if (!MOCK_MODE) return;

        const updateTx = () => {
            setMockTransactions(getMockTransactions());
        };

        updateTx();
        const interval = setInterval(updateTx, 1000);
        return () => clearInterval(interval);
    }, []);

    // Convert mock transactions to the expected format
    const transactions = mockTransactions.map(tx => ({
        id: tx.id,
        signature: tx.signature,
        amount: tx.amount,
        token: tx.token,
        status: tx.status === 'confirmed' || tx.status === 'SUCCESS' ? 'CONFIRMED' as const : tx.status === 'pending' || tx.status === 'PENDING' ? 'PENDING' as const : 'FAILED' as const,
        type: (tx.type === 'SEND' || tx.type === 'RECEIVE' || tx.type === 'TRANSFER' ? 'ONE_TIME_PAYMENT' : tx.type) as "SUBSCRIPTION_PAYMENT" | "ONE_TIME_PAYMENT" | "REFUND",
        createdAt: tx.createdAt ? new Date(tx.createdAt).toISOString() : tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString(),
        confirmedAt: (tx.status === 'confirmed' || tx.status === 'SUCCESS') 
            ? (tx.createdAt ? new Date(tx.createdAt).toISOString() : tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString()) 
            : null,
    }));

    // Not connected state
    if (!isConnected) {
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
                            Connect your wallet
                        </h4>
                        <p className="text-slate-500 text-sm">
                            Connect your wallet to view your transaction history
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // No transactions state  
    if (transactions.length === 0) {
        return (
            <section className="relative z-10 py-16 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                        Transaction History
                        {MOCK_MODE && <Beaker className="w-4 h-4 text-yellow-500" />}
                    </h3>

                    <div className="bg-white rounded-xl border border-slate-200 min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileSearch className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-slate-900 font-medium mb-1">
                            No transactions yet
                        </h4>
                        <p className="text-slate-500 text-sm">
                            {MOCK_MODE 
                                ? "Subscribe to a plan to create your first mock transaction!" 
                                : "Subscribe to a plan above to see your first on-chain transaction!"}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // With transactions
    return (
        <section className="relative z-10 py-16 bg-slate-50 border-t border-slate-200">
            <div className="max-w-4xl mx-auto px-6">
                <TransactionList transactions={transactions} />
            </div>
        </section>
    );
}
