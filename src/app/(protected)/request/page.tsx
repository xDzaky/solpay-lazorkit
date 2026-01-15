// =============================================================================
// REQUEST MONEY PAGE
// =============================================================================
// Generate Solana Pay compatible QR codes for payment requests
// Spec: https://docs.solanapay.com/spec
// =============================================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { useWallet } from "@lazorkit/wallet";
import { QRCodeSVG } from "qrcode.react";
import { 
  ArrowLeft, 
  QrCode, 
  Copy, 
  Check, 
  Share2,
  Download,
  Wallet as WalletIcon,
  Info
} from "lucide-react";
import Link from "next/link";
import { TOKENS } from "@/lib/constants";

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
  // Format: solana:<recipient>?amount=<amount>&spl-token=<mint>&label=<label>&message=<message>&memo=<memo>
  const paymentUrl = useMemo(() => {
    if (!walletAddress) return "";
    
    const baseUrl = `solana:${walletAddress}`;
    const params = new URLSearchParams();
    
    // Add amount if specified
    if (amount && parseFloat(amount) > 0) {
      params.append("amount", amount);
    }
    
    // Add SPL token mint for USDC
    if (token === "USDC") {
      params.append("spl-token", TOKENS.USDC.mint);
    }
    
    // Add app label
    params.append("label", "SolPay");
    
    // Add message/memo if description provided
    if (description) {
      params.append("message", description);
      params.append("memo", `SolPay: ${description}`);
    } else {
      params.append("message", `Payment request via SolPay`);
    }
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [walletAddress, amount, token, description]);

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
          title: "Payment Request - SolPay",
          text: description || `Send me ${amount || "some"} ${token}`,
          url: paymentUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        copyPaymentUrl();
      }
    } else {
      // Fallback to copy
      copyPaymentUrl();
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("payment-qr");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = `solpay-request-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(downloadUrl);
        }
      });
    };
    
    img.src = url;
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-8)}`;

  if (!mounted) return null;

  if (!walletAddress) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <WalletIcon className="w-16 h-16 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Wallet Connected</h3>
          <p className="text-slate-500 mb-6">Connect your wallet to generate a payment request</p>
          <Link 
            href="/dashboard"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-900">Request Payment</h1>
          <p className="text-slate-500 text-sm">Generate a Solana Pay QR code</p>
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
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              <span className="font-medium">◎ SOL</span>
            </button>
            <button
              onClick={() => setToken("USDC")}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                token === "USDC"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 hover:border-slate-300 text-slate-700"
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
          <p className="text-xs text-slate-500 mt-1">
            Leave empty to let sender choose the amount
          </p>
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
            maxLength={80}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-1">
            Will appear as memo on-chain
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-8">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg mb-6">
              <QRCodeSVG
                id="payment-qr"
                value={paymentUrl}
                size={220}
                level="H"
                includeMargin
                className="rounded-lg"
              />
            </div>
            
            {/* Payment Summary */}
            <div className="text-center mb-4">
              {amount && (
                <p className="text-3xl font-bold text-slate-900 mb-1">
                  {amount} {token}
                </p>
              )}
              {description && (
                <p className="text-slate-600 text-sm">{description}</p>
              )}
              <p className="text-xs text-slate-500 mt-2 font-mono">
                {formatAddress(walletAddress)}
              </p>
            </div>

            {/* Solana Pay Badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
              <span className="text-xs font-medium text-slate-600">Solana Pay Compatible</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={copyAddress}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Copy</span>
          </button>
          
          <button
            onClick={downloadQR}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={sharePaymentRequest}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">💡 How it works</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Scan QR code with any Solana Pay compatible wallet</li>
                <li>• Supports Phantom, Solflare, and other major wallets</li>
                <li>• Transaction will appear in your History page</li>
                <li>• Works on <strong>Solana Network only</strong> (not BEP-20/TRC-20)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
