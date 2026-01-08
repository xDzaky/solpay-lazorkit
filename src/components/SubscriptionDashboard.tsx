// =============================================================================
// SUBSCRIPTION DASHBOARD COMPONENT
// =============================================================================
// Shows user's active subscription, balance, and quick actions
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MOCK_MODE, 
  getMockSubscription, 
  getMockBalance,
  getMockTransactions,
  clearAllMockData,
  clearMockSubscription,
  type MockSubscription 
} from "@/lib/mock-mode";
import { formatUsdc } from "@/lib/utils";
import { 
  Crown, 
  Wallet, 
  Calendar, 
  CreditCard, 
  RotateCcw, 
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Beaker,
  XCircle,
  Download,
  QrCode
} from "lucide-react";

export function SubscriptionDashboard() {
  const { isConnected, smartWalletPubkey } = useWallet();
  const [subscription, setSubscription] = useState<MockSubscription | null>(null);
  const [balance, setBalance] = useState(0);
  const [txCount, setTxCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Poll for updates
  useEffect(() => {
    setMounted(true);
    
    if (!MOCK_MODE) return;

    const updateData = () => {
      setSubscription(getMockSubscription());
      setBalance(getMockBalance());
      setTxCount(getMockTransactions().length);
    };

    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle reset
  const handleReset = () => {
    if (confirm("Reset all mock data? This will restore your balance to $1,000 and clear all transactions.")) {
      clearAllMockData();
      window.location.reload();
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = () => {
    clearMockSubscription();
    setShowCancelModal(false);
    setSubscription(null);
  };

  // Download receipt
  const handleDownloadReceipt = () => {
    if (!subscription) return;
    
    const receipt = `
╔══════════════════════════════════════════════════════════════╗
║                     SOLPAY RECEIPT                           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Subscription: ${subscription.planName.padEnd(44)}║
║  Amount: $${formatUsdc(subscription.priceUsdc).padEnd(49)}║
║  Status: ${subscription.status.padEnd(50)}║
║  Start Date: ${new Date(subscription.startDate).toLocaleDateString().padEnd(46)}║
║  Next Billing: ${new Date(subscription.endDate).toLocaleDateString().padEnd(44)}║
║                                                              ║
║  Transaction ID:                                             ║
║  ${subscription.transactionSignature.slice(0, 58)}║
║                                                              ║
║  ─────────────────────────────────────────────────────────   ║
║                                                              ║
║  Powered by Lazorkit SDK                                     ║
║  Gasless transactions on Solana                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `.trim();

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solpay-receipt-${subscription.planName.toLowerCase()}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Don't render on server or if not connected
  if (!mounted || !isConnected || !MOCK_MODE) return null;

  // No subscription yet
  if (!subscription) {
    return (
      <section className="relative z-10 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <Wallet className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Your USDC Balance</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${formatUsdc(balance)}
                      {MOCK_MODE && <span className="text-xs text-yellow-600 ml-2">(Mock)</span>}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-slate-600">
                    <Clock className="w-3 h-3 mr-1" />
                    No active subscription
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">Choose a plan below</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Has active subscription
  const endDate = new Date(subscription.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <section className="relative z-10 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 overflow-hidden">
          {/* Header */}
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-lg">Your Subscription</CardTitle>
                {MOCK_MODE && (
                  <Badge variant="warning" className="text-xs">
                    <Beaker className="w-3 h-3 mr-1" />
                    Mock
                  </Badge>
                )}
              </div>
              <Badge variant="success" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Current Plan */}
              <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Sparkles className="w-4 h-4" />
                  Current Plan
                </div>
                <p className="text-xl font-bold text-slate-900">{subscription.planName}</p>
                <p className="text-sm text-slate-500">
                  ${formatUsdc(subscription.priceUsdc)}/month
                </p>
              </div>

              {/* Balance */}
              <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Wallet className="w-4 h-4" />
                  USDC Balance
                </div>
                <p className="text-xl font-bold text-slate-900">${formatUsdc(balance)}</p>
                <p className="text-sm text-slate-500">
                  {txCount} transaction{txCount !== 1 ? 's' : ''} made
                </p>
              </div>

              {/* Next Billing */}
              <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-white/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  Next Billing
                </div>
                <p className="text-xl font-bold text-slate-900">{daysLeft} days</p>
                <p className="text-sm text-slate-500">
                  {endDate.toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/50">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CreditCard className="w-4 h-4" />
                <span>Auto-renewal enabled</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownloadReceipt}
                  className="text-slate-600"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Receipt
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleReset}
                  className="text-slate-600"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Cancel Subscription?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to cancel your {subscription.planName} subscription? 
                You'll lose access to all premium features.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Subscription
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleCancelSubscription}
                >
                  Yes, Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default SubscriptionDashboard;
