// =============================================================================
// SETTINGS PAGE
// =============================================================================
// Account settings and preferences
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { 
  ArrowLeft, 
  User, 
  Wallet, 
  Shield, 
  Bell,
  Moon,
  Globe,
  LogOut,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_MODE, clearMockData, getMockBalance } from "@/lib/mock-mode";

export default function SettingsPage() {
  const { smartWalletPubkey, disconnect } = useWallet();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const walletAddress = smartWalletPubkey?.toString() || "";

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    disconnect();
    router.push("/");
  };

  const handleClearData = () => {
    clearMockData();
    setShowClearConfirm(false);
    // Refresh the page to reset state
    window.location.reload();
  };

  const formatAddress = (addr: string) => 
    `${addr.slice(0, 12)}...${addr.slice(-8)}`;

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
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm">Manage your account</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
            Account
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {/* Wallet Address */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Wallet Address</p>
                    <p className="text-sm text-slate-500 font-mono">
                      {formatAddress(walletAddress)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={copyAddress}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Passkey */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Passkey Authentication</p>
                  <p className="text-sm text-slate-500">
                    Secured with device biometrics
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ Protected by Lazorkit Smart Wallet
                  </p>
                </div>
              </div>
            </div>

            {/* View on Explorer */}
            <a
              href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">View on Explorer</p>
                  <p className="text-sm text-slate-500">Solana Devnet</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </a>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
            Preferences
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {/* Network */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Network</p>
                    <p className="text-sm text-slate-500">Solana Devnet</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  Devnet
                </span>
              </div>
            </div>

            {/* Mock Mode Status */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Demo Mode</p>
                    <p className="text-sm text-slate-500">
                      {MOCK_MODE ? "Using simulated transactions" : "Real blockchain transactions"}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  MOCK_MODE 
                    ? "bg-amber-100 text-amber-700" 
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {MOCK_MODE ? "Demo" : "Live"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Data Section */}
        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
            Data
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {/* Clear Mock Data */}
            {MOCK_MODE && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-600">Clear Demo Data</p>
                    <p className="text-sm text-slate-500">Reset balance and transactions</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>
        </section>

        {/* Disconnect Button */}
        <button
          onClick={handleDisconnect}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Disconnect Wallet
        </button>

        {/* App Info */}
        <div className="text-center text-sm text-slate-400 pt-4">
          <p>SolPay v1.0.0</p>
          <p className="mt-1">Powered by Lazorkit SDK</p>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Clear Demo Data?</h3>
              <p className="text-slate-500">
                This will reset your balance to default values and clear all transaction history.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
