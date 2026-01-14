// =============================================================================
// DASHBOARD PAGE
// =============================================================================
// Main dashboard showing balance, quick actions, and recent activity
// =============================================================================

"use client";

import { useWallet } from "@lazorkit/wallet";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useRealBalance } from "@/hooks/useRealBalance";
import { MOCK_MODE, getMockTransactions, getMockSubscription } from "@/lib/mock-mode";
import { formatUsdc } from "@/lib/utils";
import { useEffect, useState } from "react";
import { 
  Crown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink,
  Sparkles,
  Copy,
  Check
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { smartWalletPubkey } = useWallet();
  const { solBalance, usdcBalance, isLoading, isMock, refresh } = useRealBalance();
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Load mock data
  useEffect(() => {
    if (!MOCK_MODE) return;
    
    const update = () => {
      setRecentTx(getMockTransactions().slice(0, 5));
      setSubscription(getMockSubscription());
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const copyAddress = async () => {
    if (smartWalletPubkey) {
      await navigator.clipboard.writeText(smartWalletPubkey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h1>
        {smartWalletPubkey && (
          <button 
            onClick={copyAddress}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <span className="font-mono text-sm">
              {formatAddress(smartWalletPubkey.toString())}
            </span>
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <BalanceCard 
          token="SOL" 
          balance={solBalance} 
          isLoading={isLoading}
          isMock={isMock}
        />
        <BalanceCard 
          token="USDC" 
          balance={usdcBalance} 
          isLoading={isLoading}
          isMock={isMock}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-slate-500 mb-4">Quick Actions</h2>
        <QuickActions onRefresh={refresh} />
      </div>

      {/* Active Subscription */}
      {subscription && (
        <div className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{subscription.planName} Plan</p>
                <p className="text-sm text-slate-500">
                  {formatUsdc(subscription.priceUsdc)}/month
                </p>
              </div>
            </div>
            <Link 
              href="/subscribe"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Manage →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-500">Recent Transactions</h2>
          <Link 
            href="/transactions"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All →
          </Link>
        </div>
        
        {recentTx.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No transactions yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Send or receive funds to see activity here
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {recentTx.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === "SUBSCRIPTION_PAYMENT" 
                      ? "bg-purple-100" 
                      : "bg-indigo-100"
                  }`}>
                    <ArrowUpRight className={`w-4 h-4 ${
                      tx.type === "SUBSCRIPTION_PAYMENT" 
                        ? "text-purple-600" 
                        : "text-indigo-600"
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {tx.planName || "Transfer"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900 text-sm">
                    -{formatUsdc(tx.amount)}
                  </p>
                  <p className="text-xs text-slate-400">{tx.token}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
