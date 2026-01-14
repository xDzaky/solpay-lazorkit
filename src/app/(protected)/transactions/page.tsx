// =============================================================================
// TRANSACTIONS PAGE
// =============================================================================
// Full transaction history with filters
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { ArrowLeft, Filter, ExternalLink, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getMockTransactions, type MockTransaction } from "@/lib/mock-mode";

type FilterType = "all" | "sent" | "received" | "subscription";

export default function TransactionsPage() {
  const { smartWalletPubkey } = useWallet();
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const walletAddress = smartWalletPubkey?.toString() || "";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadTransactions();
    }
  }, [mounted, walletAddress]);

  const loadTransactions = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      const mockTxs = getMockTransactions();
      setTransactions(mockTxs);
      setIsLoading(false);
    }, 500);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "sent") return tx.type === "SEND";
    if (filter === "received") return tx.type === "RECEIVE";
    if (filter === "subscription") return tx.type === "SUBSCRIPTION_PAYMENT";
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SEND":
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case "RECEIVE":
        return <ArrowDownLeft className="w-5 h-5 text-emerald-500" />;
      case "SUBSCRIPTION_PAYMENT":
        return <RefreshCw className="w-5 h-5 text-indigo-500" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "SEND":
        return "Sent";
      case "RECEIVE":
        return "Received";
      case "SUBSCRIPTION_PAYMENT":
        return "Subscription";
      default:
        return type;
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case "SEND":
        return "bg-red-50";
      case "RECEIVE":
        return "bg-emerald-50";
      case "SUBSCRIPTION_PAYMENT":
        return "bg-indigo-50";
      default:
        return "bg-slate-50";
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
            <p className="text-slate-500 text-sm">Your complete transaction history</p>
          </div>
        </div>
        <button
          onClick={loadTransactions}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`w-5 h-5 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "all", label: "All" },
          { key: "sent", label: "Sent" },
          { key: "received", label: "Received" },
          { key: "subscription", label: "Subscriptions" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as FilterType)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {isLoading ? (
          // Loading skeleton
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-32" />
                </div>
                <div className="h-5 bg-slate-200 rounded w-16" />
              </div>
            </div>
          ))
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No transactions</h3>
            <p className="text-slate-500">
              {filter === "all" 
                ? "You haven't made any transactions yet"
                : `No ${filter} transactions found`}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeBgColor(tx.type)}`}>
                  {getTypeIcon(tx.type)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">
                      {getTypeLabel(tx.type)}
                    </span>
                    {tx.status === "SUCCESS" && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        Success
                      </span>
                    )}
                    {tx.status === "PENDING" && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                        Pending
                      </span>
                    )}
                    {tx.status === "FAILED" && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        Failed
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    {tx.type === "SEND" && tx.toAddress && (
                      <span>To {formatAddress(tx.toAddress)}</span>
                    )}
                    {tx.type === "RECEIVE" && tx.fromAddress && (
                      <span>From {formatAddress(tx.fromAddress)}</span>
                    )}
                    {tx.type === "SUBSCRIPTION_PAYMENT" && (
                      <span>{tx.description || "Subscription payment"}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {formatDate(tx.createdAt)}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <div className={`font-semibold ${
                    tx.type === "RECEIVE" ? "text-emerald-600" : "text-slate-900"
                  }`}>
                    {tx.type === "RECEIVE" ? "+" : "-"}{tx.amount} {tx.token}
                  </div>
                  {tx.signature && (
                    <a
                      href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 justify-end mt-1"
                    >
                      Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      {!isLoading && filteredTransactions.length > 0 && (
        <div className="mt-8 p-4 bg-slate-50 rounded-xl">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {transactions.filter(t => t.type === "SEND").length}
              </p>
              <p className="text-xs text-slate-500">Sent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {transactions.filter(t => t.type === "RECEIVE").length}
              </p>
              <p className="text-xs text-slate-500">Received</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {transactions.filter(t => t.type === "SUBSCRIPTION_PAYMENT").length}
              </p>
              <p className="text-xs text-slate-500">Subscriptions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
