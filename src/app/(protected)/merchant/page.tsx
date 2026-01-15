// =============================================================================
// MERCHANT PORTAL PAGE
// =============================================================================
// Dashboard for merchants to view revenue analytics, transactions, and subscribers
// Demonstrates B2B use case for SolPay subscription platform
// =============================================================================

"use client";

import { useState, useEffect } from "react";
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
  Clock
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
import { getMockTransactions, MOCK_MODE } from "@/lib/mock-mode";
import { formatUsdc } from "@/lib/utils";
import { getExplorerUrl } from "@/lib/constants";

// Mock merchant data
const MERCHANT_DATA = {
  name: "SolPay Merchant",
  walletAddress: "EyJfxrAxws2VZaPnU8ifQ6NoH7B7XBVDbqrfX191cqYU",
  totalRevenue: 15420.50,
  monthlyRevenue: 2340.00,
  totalSubscribers: 156,
  activeSubscribers: 142,
  churnRate: 8.97,
};

// Revenue by plan data
const revenueByPlan = [
  { name: "Basic", value: 2500, color: "#6366f1" },
  { name: "Pro", value: 8500, color: "#8b5cf6" },
  { name: "Enterprise", value: 4420, color: "#a855f7" },
];

// Monthly trend data
const monthlyTrend = [
  { month: "Sep", revenue: 1200, subscribers: 45 },
  { month: "Oct", revenue: 1800, subscribers: 78 },
  { month: "Nov", revenue: 2100, subscribers: 112 },
  { month: "Dec", revenue: 2340, subscribers: 142 },
  { month: "Jan", revenue: 2800, subscribers: 156 },
];

export default function MerchantPage() {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (MOCK_MODE) {
      const update = () => {
        const txs = getMockTransactions();
        // Only show subscription payments for merchant view
        setTransactions(txs.filter(tx => tx.type === "SUBSCRIPTION_PAYMENT").slice(0, 10));
      };
      update();
      const interval = setInterval(update, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  const copyAddress = async (addr: string) => {
    await navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Merchant Portal</h1>
            <p className="text-sm text-slate-500">Revenue analytics & subscriber management</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ${MERCHANT_DATA.totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">Total Revenue</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              MRR
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ${MERCHANT_DATA.monthlyRevenue.toLocaleString()}
          </p>
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
          <p className="text-2xl font-bold text-slate-900">
            {MERCHANT_DATA.activeSubscribers}
          </p>
          <p className="text-sm text-slate-500">Active Subscribers</p>
        </div>

        {/* Churn Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              Low
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {MERCHANT_DATA.churnRate}%
          </p>
          <p className="text-sm text-slate-500">Churn Rate</p>
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
        </div>

        {/* Monthly Trend - Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Monthly Growth</h3>
          </div>
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
        </div>
      </div>

      {/* Merchant Wallet */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Receiving Wallet</p>
            <button 
              onClick={() => copyAddress(MERCHANT_DATA.walletAddress)}
              className="flex items-center gap-2 font-mono text-sm text-slate-700 hover:text-slate-900"
            >
              {formatAddress(MERCHANT_DATA.walletAddress)}
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <a
            href={getExplorerUrl("address", MERCHANT_DATA.walletAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            View on Explorer
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Recent Subscription Payments</h3>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No subscription payments yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Payments will appear here when users subscribe
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {tx.planName || "Subscription Payment"}
                    </p>
                    <p className="text-sm text-slate-400">
                      From: {formatAddress(tx.fromAddress || tx.from || "Unknown")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">
                    +{formatUsdc(tx.amount)}
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
