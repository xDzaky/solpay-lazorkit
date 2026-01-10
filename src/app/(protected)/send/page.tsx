// =============================================================================
// SEND MONEY PAGE
// =============================================================================
// Form to send SOL or USDC to another address
// =============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@lazorkit/wallet";
import { useSendTransaction } from "@/hooks/useSendTransaction";
import { useRealBalance } from "@/hooks/useRealBalance";
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Clipboard,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { MOCK_MODE } from "@/lib/mock-mode";
import confetti from "canvas-confetti";

type TokenType = "SOL" | "USDC";

export default function SendPage() {
  const router = useRouter();
  const { smartWalletPubkey } = useWallet();
  const { sendSOL, sendUSDC, isProcessing, error, clearError } = useSendTransaction();
  const { solBalance, usdcBalance, isMock } = useRealBalance();
  
  const [token, setToken] = useState<TokenType>("USDC");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const balance = token === "SOL" ? solBalance : usdcBalance;

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setRecipient(text);
  };

  const handleMax = () => {
    setAmount(balance.toString());
  };

  const celebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#10b981']
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess(null);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    let result;
    if (token === "SOL") {
      result = await sendSOL(recipient, amountNum, memo);
    } else {
      result = await sendUSDC(recipient, amountNum, memo);
    }

    if (result.success) {
      setSuccess(result.signature!);
      celebrate();
      // Reset form
      setRecipient("");
      setAmount("");
      setMemo("");
    }
  };

  const isValidAddress = recipient.length >= 32 && recipient.length <= 44;
  const hasEnoughBalance = parseFloat(amount || "0") <= balance;
  const canSubmit = isValidAddress && parseFloat(amount || "0") > 0 && hasEnoughBalance && !isProcessing;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Send Money</h1>
          <p className="text-slate-500 text-sm">Transfer SOL or USDC to any address</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-800">Transaction Sent!</p>
              <p className="text-sm text-emerald-600 mt-1">
                Signature: {success.slice(0, 16)}...
              </p>
              <button
                onClick={() => setSuccess(null)}
                className="text-sm text-emerald-700 hover:text-emerald-800 mt-2 underline"
              >
                Send another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Transaction Failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Token Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Token
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setToken("SOL")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                token === "SOL"
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold">◎</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900">SOL</p>
                  <p className="text-sm text-slate-500">{solBalance.toFixed(4)} available</p>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setToken("USDC")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                token === "USDC"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-white font-bold">$</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900">USDC</p>
                  <p className="text-sm text-slate-500">${usdcBalance.toFixed(2)} available</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Recipient Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter Solana address..."
              className="w-full px-4 py-3 pr-20 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <Clipboard className="w-4 h-4" />
              Paste
            </button>
          </div>
          {recipient && !isValidAddress && (
            <p className="text-sm text-red-500 mt-1">Invalid Solana address</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              className="w-full px-4 py-3 pr-20 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
            />
            <button
              type="button"
              onClick={handleMax}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Max
            </button>
          </div>
          {amount && !hasEnoughBalance && (
            <p className="text-sm text-red-500 mt-1">Insufficient balance</p>
          )}
        </div>

        {/* Memo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Memo (optional)
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="What's this for?"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Gas Fee Notice */}
        <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <p className="text-sm text-indigo-700">
            Gas fees sponsored by Lazorkit — completely free!
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send {token}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
