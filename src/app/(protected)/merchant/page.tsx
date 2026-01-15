// =============================================================================
// MERCHANT PORTAL PAGE
// =============================================================================
// Dashboard for merchants to view revenue analytics, transactions, and subscribers
// Demonstrates B2B use case for SolPay subscription platform
// Now connected to real user transaction data
// =============================================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { useWallet } from "@lazorkit/wallet";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Copy,
  Check,
  Store,
  CreditCard,
  BarChart3,
  Clock,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { getMockTransactions, getMockSubscription, MOCK_MODE, MockTransaction } from "@/lib/mock-mode";
import { formatUsdc } from "@/lib/utils";
import { getExplorerUrl } from "@/lib/constants";

export default function MerchantPage() {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load transactions
  useEffect(() => {
    const update = () => {
      const txs = getMockTransactions();
      setTransactions(txs);
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  // Calculate real stats from transactions
  const stats = useMemo(() => {
    const subscriptionTxs = transactions.filter(tx => tx.type === "SUBSCRIPTION_PAYMENT");
    const allTxs = transactions;
    
    // Total revenue from all transactions
    const totalRevenue = allTxs
      .filter(tx => tx.type === "SUBSCRIPTION_PAYMENT" || tx.type === "RECEIVE")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    // Get unique subscriptions
    const activeSubscription = getMockSubscription();
    const activeSubscribers = activeSubscription?.status === "ACTIVE" ? 1 : 0;
    
    // Monthly revenue (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const monthlyRevenue = subscriptionTxs
      .filter(tx => (tx.timestamp || 0) > thirtyDaysAgo)
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    // Revenue by plan
    const planRevenue: Record<string, number> = {};
    subscriptionTxs.forEach(tx => {
      const planName = tx.planName || "Unknown";
      planRevenue[planName] = (planRevenue[planName] || 0) + (tx.amount || 0);
    });
    
    return {
      totalRevenue,
      monthlyRevenue,
      activeSubscribers,
      totalTransactions: allTxs.length,
      subscriptionCount: subscriptionTxs.length,
      planRevenue,
    };
  }, [transactions]);

  // Generate chart data from real transactions
  const revenueByPlan = useMemo(() => {
    const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e"];
    return Object.entries(stats.planRevenue).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [stats.planRevenue]);

  // Monthly trend from real transactions
  const monthlyTrend = useMemo(() => {
    const months: Record<string, number> = {};
    transactions.forEach(tx => {
      if (tx.timestamp) {
        const date = new Date(tx.timestamp);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        months[monthKey] = (months[monthKey] || 0) + (tx.amount || 0);
      }
    });
    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
  }, [transactions]);

  const copyAddress = async (addr: string) => {
    await navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const walletAddress = smartWalletPubkey?.toString() || "";

  const hasData = transactions.length > 0;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Merchant Portal</h1>
              <p className="text-sm text-slate-500">Revenue analytics & subscriber management</p>
            </div>
          </div>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* No Data State */}
      {!hasData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900">No transaction data yet</h3>
              <p className="text-sm text-amber-700 mt-1">
                Start by subscribing to a plan or receiving payments. Your analytics will appear here based on real transactions.
              </p>
              <div className="mt-3 flex gap-2">
                <a href="/subscribe" className="text-sm font-medium text-amber-700 hover:text-amber-900 underline">
                  Subscribe to a plan →
                </a>
                <span className="text-amber-400">|</span>
                <a href="/request" className="text-sm font-medium text-amber-700 hover:text-amber-900 underline">
                  Request payment →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            {hasData && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                Live
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-slate-500">Total Revenue</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              MRR
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">${stats.monthlyRevenue.toFixed(2)}</p>
          <p className="text-sm text-slate-500">Monthly Recurring</p>
        </div>

        {/* Active Subscribers */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.activeSubscribers}</p>
          <p className="text-sm text-slate-500">Active Subscriptions</p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              All Time
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalTransactions}</p>
          <p className="text-sm text-slate-500">Total Transactions</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Plan - Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Revenue by Plan</h3>
          </div>
          {revenueByPlan.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByPlan}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueByPlan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p>Subscribe to plans to see revenue breakdown</p>
            </div>
          )}
        </div>

        {/* Monthly Trend - Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Monthly Growth</h3>
          </div>
          {monthlyTrend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p>Transaction history will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Your Wallet */}
      {walletAddress && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Your Receiving Wallet</p>
              <button 
                onClick={() => copyAddress(walletAddress)}
                className="flex items-center gap-2 font-mono text-sm text-slate-700 hover:text-slate-900"
              >
                {formatAddress(walletAddress)}
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <a
              href={getExplorerUrl("address", walletAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              View on Explorer
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No transactions yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Your transactions will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === "SUBSCRIPTION_PAYMENT" || tx.type === "RECEIVE" 
                      ? "bg-emerald-100" 
                      : "bg-blue-100"
                  }`}>
                    {tx.type === "SUBSCRIPTION_PAYMENT" || tx.type === "RECEIVE" ? (
                      <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {tx.planName || tx.description || tx.type?.replace("_", " ") || "Transaction"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {tx.type === "SEND" ? "To: " : "From: "}
                      {formatAddress(tx.toAddress || tx.to || tx.fromAddress || tx.from || "Unknown")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === "SUBSCRIPTION_PAYMENT" || tx.type === "RECEIVE" 
                      ? "text-emerald-600" 
                      : "text-slate-900"
                  }`}>
                    {tx.type === "SUBSCRIPTION_PAYMENT" || tx.type === "RECEIVE" ? "+" : "-"}
                    {formatUsdc(tx.amount)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(tx.timestamp || tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features Highlight */}
      <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">Merchant Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Gasless for Users</p>
              <p className="text-slate-500">You pay 0 fees, users pay 0 fees</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Instant Settlement</p>
              <p className="text-slate-500">Receive USDC in ~400ms</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-700">SPL Memo Tagging</p>
              <p className="text-slate-500">All transactions are traceable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
