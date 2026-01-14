// =============================================================================
// REQUEST MONEY PAGE
// =============================================================================
// Generate QR code for payment requests
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { QRCodeSVG } from "qrcode.react";
import { 
  ArrowLeft, 
  QrCode, 
  Copy, 
  Check, 
  Share2,
  Download
} from "lucide-react";
import Link from "next/link";

type TokenType = "SOL" | "USDC";

export default function RequestPage() {
  const { smartWalletPubkey } = useWallet();
  const [token, setToken] = useState<TokenType>("USDC");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const walletAddress = smartWalletPubkey?.toString() || "";

  // Generate Solana Pay URL
  const generatePaymentUrl = () => {
    if (!walletAddress) return "";
    
    let url = `solana:${walletAddress}`;
    const params: string[] = [];
    
    if (amount) {
      params.push(`amount=${amount}`);
    }
    
    if (token === "USDC") {
      // USDC mint address for devnet
      params.push(`spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`);
    }
    
    if (description) {
      params.push(`memo=${encodeURIComponent(description)}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }
    
    return url;
  };

  const paymentUrl = generatePaymentUrl();

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPaymentUrl = async () => {
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sharePaymentRequest = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Payment Request",
          text: description || `Send me ${amount || "some"} ${token}`,
          url: paymentUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log("Share cancelled");
      }
    } else {
      // Fallback to copy
      copyPaymentUrl();
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-8)}`;

  if (!mounted) return null;

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
          <h1 className="text-2xl font-bold text-slate-900">Request Money</h1>
          <p className="text-slate-500 text-sm">Generate a QR code for payment</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Token Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Request Token
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setToken("SOL")}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                token === "SOL"
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="font-medium">◎ SOL</span>
            </button>
            <button
              onClick={() => setToken("USDC")}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                token === "USDC"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="font-medium">$ USDC</span>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Amount (optional)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this for? e.g., Lunch split 🍜"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg mb-6">
              <QRCodeSVG
                value={paymentUrl}
                size={200}
                level="H"
                includeMargin
                className="rounded-lg"
              />
            </div>
            
            {amount && (
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-slate-900">
                  {amount} {token}
                </p>
                {description && (
                  <p className="text-slate-500 mt-1">{description}</p>
                )}
              </div>
            )}

            <p className="text-sm text-slate-500 mb-2">Your Address</p>
            <p className="font-mono text-sm text-slate-700 mb-4">
              {formatAddress(walletAddress)}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={copyAddress}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copy Address
              </button>
              
              <button
                onClick={sharePaymentRequest}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-600">
            <strong>How it works:</strong> Share this QR code with anyone who wants to send you {token}. 
            They can scan it with any Solana-compatible wallet to initiate the transfer.
          </p>
        </div>
      </div>
    </div>
  );
}
