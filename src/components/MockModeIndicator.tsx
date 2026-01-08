// =============================================================================
// MOCK MODE INDICATOR
// =============================================================================
// Banner that shows when mock mode is active for testing
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { MOCK_MODE, getMockBalance, getMockTransactions, getMockSubscription } from "@/lib/mock-mode";
import { X, Beaker, Wallet, CreditCard, History } from "lucide-react";
import { formatUsdc } from "@/lib/utils";

export function MockModeIndicator() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mockData, setMockData] = useState({
    balance: 0,
    transactions: 0,
    subscription: null as string | null,
  });

  // Update mock data periodically
  useEffect(() => {
    if (!MOCK_MODE) return;

    const updateData = () => {
      setMockData({
        balance: getMockBalance(),
        transactions: getMockTransactions().length,
        subscription: getMockSubscription()?.planName || null,
      });
    };

    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Don't render if not in mock mode
  if (!MOCK_MODE || !isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main Banner */}
      <div 
        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4 animate-pulse" />
          <span className="font-semibold text-sm">
            🧪 MOCK MODE ACTIVE - No real tokens used
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden sm:flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              ${formatUsdc(mockData.balance)}
            </span>
            <span className="flex items-center gap-1">
              <History className="w-3 h-3" />
              {mockData.transactions} tx
            </span>
            {mockData.subscription && (
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {mockData.subscription}
              </span>
            )}
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="p-1 hover:bg-black/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-400 p-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              Mock Mode Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 mb-1">
                  <Wallet className="w-4 h-4" />
                  <span className="font-medium">Balance</span>
                </div>
                <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                  ${formatUsdc(mockData.balance)} USDC
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Started with $1,000.00
                </p>
              </div>
              
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 mb-1">
                  <History className="w-4 h-4" />
                  <span className="font-medium">Transactions</span>
                </div>
                <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                  {mockData.transactions}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Mock signatures generated
                </p>
              </div>
              
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-medium">Subscription</span>
                </div>
                <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                  {mockData.subscription || "None"}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  {mockData.subscription ? "Active mock subscription" : "Subscribe to a plan"}
                </p>
              </div>
            </div>
            
            <p className="mt-3 text-xs text-yellow-700 dark:text-yellow-300">
              💡 <strong>Tip:</strong> All transactions are simulated. Refresh the page to reset your balance to $1,000 USDC.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockModeIndicator;
