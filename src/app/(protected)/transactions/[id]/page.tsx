// =============================================================================
// TRANSACTION DETAIL PAGE
// =============================================================================
// Detailed view of a single transaction
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@lazorkit/wallet";
import { 
  ArrowLeft, 
  Check, 
  Clock, 
  XCircle,
  Copy,
  ExternalLink,
  Share2,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { getMockTransactions, type MockTransaction } from "@/lib/mock-mode";

export default function TransactionDetailPage() {
  const params = useParams();
  const { smartWalletPubkey } = useWallet();
  const [transaction, setTransaction] = useState<MockTransaction | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const txId = params.id as string;
  const walletAddress = smartWalletPubkey?.toString() || "";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !txId) return;

    // Find transaction in mock data
    const transactions = getMockTransactions();
    const found = transactions.find(tx => tx.id === txId || tx.signature === txId);
    setTransaction(found || null);
  }, [mounted, txId]);

  const copySignature = async () => {
    if (transaction?.signature) {
      await navigator.clipboard.writeText(transaction.signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareTransaction = async () => {
    if (!transaction) return;
    
    const url = `https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Transaction Details",
          text: `${transaction.type === "SEND" ? "Sent" : "Received"} ${transaction.amount} ${transaction.token}`,
          url: url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "confirmed":
        return {
          icon: Check,
          color: "text-emerald-600",
          bg: "bg-emerald-100",
          label: "Confirmed",
        };
      case "PENDING":
      case "pending":
        return {
          icon: Clock,
          color: "text-amber-600",
          bg: "bg-amber-100",
          label: "Pending",
        };
      default:
        return {
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-100",
          label: "Failed",
        };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "SEND":
        return {
          icon: ArrowUpRight,
          color: "text-red-600",
          bg: "bg-red-100",
          label: "Sent",
        };
      case "RECEIVE":
        return {
          icon: ArrowDownLeft,
          color: "text-emerald-600",
          bg: "bg-emerald-100",
          label: "Received",
        };
      case "SUBSCRIPTION_PAYMENT":
        return {
          icon: RefreshCw,
          color: "text-indigo-600",
          bg: "bg-indigo-100",
          label: "Subscription",
        };
      default:
        return {
          icon: ArrowUpRight,
          color: "text-slate-600",
          bg: "bg-slate-100",
          label: type,
        };
    }
  };

  if (!mounted) return null;

  if (!transaction) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/transactions"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Transaction</h1>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Transaction not found</h3>
          <p className="text-slate-500 mb-6">
            The transaction you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(transaction.status);
  const typeConfig = getTypeConfig(transaction.type);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/transactions"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Details</h1>
          <p className="text-slate-500 text-sm">View transaction information</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <div className={`w-16 h-16 ${statusConfig.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">{statusConfig.label}</h2>
          <div className="flex items-center justify-center gap-2">
            <div className={`p-1 ${typeConfig.bg} rounded`}>
              <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
            </div>
            <span className="text-slate-600">{typeConfig.label}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 text-center">
          <p className="text-sm text-slate-600 mb-1">Amount</p>
          <p className={`text-4xl font-bold ${
            transaction.type === "RECEIVE" ? "text-emerald-600" : "text-slate-900"
          }`}>
            {transaction.type === "RECEIVE" ? "+" : "-"}{transaction.amount} {transaction.token}
          </p>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {/* Type */}
          <div className="p-4 flex justify-between">
            <span className="text-slate-500">Type</span>
            <span className="font-medium text-slate-900">{typeConfig.label}</span>
          </div>

          {/* From */}
          {transaction.fromAddress && (
            <div className="p-4 flex justify-between items-center">
              <span className="text-slate-500">From</span>
              <span className="font-mono text-sm text-slate-900">
                {transaction.fromAddress === walletAddress 
                  ? `${formatAddress(transaction.fromAddress)} (You)` 
                  : formatAddress(transaction.fromAddress)}
              </span>
            </div>
          )}

          {/* To */}
          {transaction.toAddress && (
            <div className="p-4 flex justify-between items-center">
              <span className="text-slate-500">To</span>
              <span className="font-mono text-sm text-slate-900">
                {transaction.toAddress === walletAddress 
                  ? `${formatAddress(transaction.toAddress)} (You)` 
                  : formatAddress(transaction.toAddress)}
              </span>
            </div>
          )}

          {/* Date */}
          <div className="p-4 flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="text-slate-900">{formatDate(transaction.createdAt)}</span>
          </div>

          {/* Description/Memo */}
          {transaction.description && (
            <div className="p-4 flex justify-between">
              <span className="text-slate-500">Memo</span>
              <span className="text-slate-900">{transaction.description}</span>
            </div>
          )}

          {/* Gas Fee */}
          <div className="p-4 flex justify-between items-center">
            <span className="text-slate-500">Gas Fee</span>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-emerald-600 font-medium">0 SOL (Sponsored)</span>
            </div>
          </div>

          {/* Signature */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500">Signature</span>
              <button
                onClick={copySignature}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-slate-600 break-all">
              {transaction.signature}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <a
            href={`https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </a>
          <button
            onClick={shareTransaction}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Back Link */}
        <Link
          href="/transactions"
          className="block text-center text-indigo-600 hover:text-indigo-700"
        >
          ← Back to History
        </Link>
      </div>
    </div>
  );
}
