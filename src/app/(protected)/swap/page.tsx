// =============================================================================
// SWAP PAGE - SOL ↔ USDC Exchange
// =============================================================================
// Real-time swap interface with live price from CoinGecko
// Simulated swap for devnet testing
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import { 
  ArrowLeft, 
  ArrowDownUp, 
  RefreshCw, 
  Info,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getPriceData, 
  calculateSwapOutput, 
  formatPrice,
  PriceData 
} from "@/lib/price";
import { 
  getMockBalance, 
  getMockSolBalance,
  deductMockBalance,
  deductMockSolBalance,
  addMockBalance,
  addMockSolBalance,
  addMockTransaction,
  MOCK_MODE 
} from "@/lib/mock-mode";
import { useRealBalance } from "@/hooks/useRealBalance";
import { formatUsdc } from "@/lib/utils";
import confetti from "canvas-confetti";

type SwapDirection = "sol-to-usdc" | "usdc-to-sol";

// localStorage keys for simulated swap balances
const SWAP_STORAGE_KEYS = {
  SOL_ADJUSTMENT: 'solpay_swap_sol_adjustment',
  USDC_ADJUSTMENT: 'solpay_swap_usdc_adjustment',
};

// Helper functions for swap simulation
function getSwapAdjustment(key: string): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(key);
  return stored ? parseFloat(stored) : 0;
}

function setSwapAdjustment(key: string, value: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value.toString());
}

export default function SwapPage() {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [mounted, setMounted] = useState(false);
  
  // Use real balance hook (reads from blockchain)
  const { solBalance: realSolBalance, usdcBalance: realUsdcBalance, refresh } = useRealBalance();
  
  // Simulated swap adjustments (persisted in localStorage)
  const [solAdjustment, setSolAdjustment] = useState(0);
  const [usdcAdjustment, setUsdcAdjustment] = useState(0);
  
  // Price state
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);
  
  // Swap state
  const [direction, setDirection] = useState<SwapDirection>("sol-to-usdc");
  const [inputAmount, setInputAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5); // 0.5%
  
  // Calculate effective balances (real + simulated adjustment)
  const solBalance = Math.max(0, (realSolBalance ?? 0) + solAdjustment);
  const usdcBalance = Math.max(0, (realUsdcBalance ?? 0) + usdcAdjustment);
  
  // Transaction state
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  // Initialize and load swap adjustments from localStorage
  useEffect(() => {
    setMounted(true);
    // Load simulated swap adjustments
    setSolAdjustment(getSwapAdjustment(SWAP_STORAGE_KEYS.SOL_ADJUSTMENT));
    setUsdcAdjustment(getSwapAdjustment(SWAP_STORAGE_KEYS.USDC_ADJUSTMENT));
  }, []);

  // Fetch price data
  const fetchPrice = useCallback(async () => {
    setPriceLoading(true);
    setPriceError(null);
    try {
      const data = await getPriceData();
      setPriceData(data);
    } catch (error) {
      setPriceError("Failed to fetch price");
    } finally {
      setPriceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    // Refresh price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  // Calculate swap output
  const swapOutput = inputAmount && priceData
    ? calculateSwapOutput(
        parseFloat(inputAmount),
        direction,
        priceData.solUsd,
        slippage / 100
      )
    : null;

  // Get input/output token info
  const inputToken = direction === "sol-to-usdc" ? "SOL" : "USDC";
  const outputToken = direction === "sol-to-usdc" ? "USDC" : "SOL";
  const inputBalance = direction === "sol-to-usdc" ? solBalance : usdcBalance;
  const outputBalance = direction === "sol-to-usdc" ? usdcBalance : solBalance;

  // Toggle swap direction
  const toggleDirection = () => {
    setDirection(d => d === "sol-to-usdc" ? "usdc-to-sol" : "sol-to-usdc");
    setInputAmount("");
  };

  // Set max amount
  const setMaxAmount = () => {
    // Leave some SOL for fees if swapping SOL
    const max = direction === "sol-to-usdc" 
      ? Math.max(0, inputBalance - 0.01) 
      : inputBalance;
    setInputAmount(max.toFixed(direction === "sol-to-usdc" ? 4 : 2));
  };

  // Execute swap
  const executeSwap = async () => {
    if (!inputAmount || !swapOutput || !priceData) return;
    
    const amount = parseFloat(inputAmount);
    
    // Validate balance
    if (amount > inputBalance) {
      setSwapError(`Insufficient ${inputToken} balance`);
      return;
    }

    setIsSwapping(true);
    setSwapError(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (MOCK_MODE) {
        if (direction === "sol-to-usdc") {
          // Deduct SOL, add USDC
          deductMockSolBalance(amount * 1_000_000_000);
          addMockBalance(swapOutput.outputAmount * 1_000_000);
        } else {
          // Deduct USDC, add SOL
          deductMockBalance(amount * 1_000_000);
          addMockSolBalance(swapOutput.outputAmount * 1_000_000_000);
        }

        // Record transaction
        addMockTransaction({
          type: "TRANSFER",
          token: inputToken,
          amount: amount,
          from: smartWalletPubkey?.toString() || "",
          fromAddress: smartWalletPubkey?.toString() || "",
          to: "Swap Pool",
          toAddress: "SwapPool",
          description: `Swap ${amount.toFixed(4)} ${inputToken} → ${swapOutput.outputAmount.toFixed(4)} ${outputToken}`,
        });
      } else {
        // Non-mock mode: Update simulated swap adjustments
        if (direction === "sol-to-usdc") {
          // Deduct SOL, add USDC (simulated)
          const newSolAdj = solAdjustment - amount;
          const newUsdcAdj = usdcAdjustment + swapOutput.outputAmount;
          setSolAdjustment(newSolAdj);
          setUsdcAdjustment(newUsdcAdj);
          setSwapAdjustment(SWAP_STORAGE_KEYS.SOL_ADJUSTMENT, newSolAdj);
          setSwapAdjustment(SWAP_STORAGE_KEYS.USDC_ADJUSTMENT, newUsdcAdj);
        } else {
          // Deduct USDC, add SOL (simulated)
          const newUsdcAdj = usdcAdjustment - amount;
          const newSolAdj = solAdjustment + swapOutput.outputAmount;
          setSolAdjustment(newSolAdj);
          setUsdcAdjustment(newUsdcAdj);
          setSwapAdjustment(SWAP_STORAGE_KEYS.SOL_ADJUSTMENT, newSolAdj);
          setSwapAdjustment(SWAP_STORAGE_KEYS.USDC_ADJUSTMENT, newUsdcAdj);
        }
      }

      setSwapSuccess(true);
      setInputAmount("");
      
      // Refresh balance after swap
      refresh();
      
      // Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7']
      });

      // Reset success state after animation
      setTimeout(() => setSwapSuccess(false), 3000);

    } catch (error) {
      setSwapError("Swap failed. Please try again.");
    } finally {
      setIsSwapping(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Swap</h1>
          <p className="text-slate-500 text-sm">Exchange SOL ↔ USDC instantly</p>
        </div>
        <button
          onClick={fetchPrice}
          disabled={priceLoading}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh price"
        >
          <RefreshCw className={`w-5 h-5 text-slate-500 ${priceLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Price Display */}
      {priceData && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span className="text-sm text-slate-600">SOL Price</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-indigo-600">${formatPrice(priceData.solUsd)}</p>
              <p className="text-xs text-slate-400">
                Updated {priceData.lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {priceError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{priceError}</span>
          </div>
        </div>
      )}

      {/* Swap Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Input Section */}
        <div className="p-5 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">You pay</span>
            <span className="text-sm text-slate-500">
              Balance: {inputBalance.toFixed(direction === "sol-to-usdc" ? 4 : 2)} {inputToken}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="any"
              className="flex-1 text-3xl font-semibold bg-transparent border-none outline-none text-slate-900 placeholder-slate-300"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={setMaxAmount}
                className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
              >
                MAX
              </button>
              <div className="px-3 py-2 bg-white rounded-lg border border-slate-200 font-medium text-slate-700">
                {direction === "sol-to-usdc" ? "◎ SOL" : "$ USDC"}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Direction Toggle */}
        <div className="relative h-0">
          <motion.button
            onClick={toggleDirection}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-colors shadow-sm"
          >
            <ArrowDownUp className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Output Section */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">You receive</span>
            <span className="text-sm text-slate-500">
              Balance: {outputBalance.toFixed(direction === "sol-to-usdc" ? 2 : 4)} {outputToken}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-3xl font-semibold text-slate-900">
              {swapOutput ? swapOutput.outputAmount.toFixed(direction === "sol-to-usdc" ? 2 : 6) : "0.00"}
            </div>
            <div className="px-3 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">
              {direction === "sol-to-usdc" ? "$ USDC" : "◎ SOL"}
            </div>
          </div>
        </div>

        {/* Swap Details */}
        {swapOutput && inputAmount && (
          <div className="px-5 pb-5">
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Rate</span>
                <span className="text-slate-700">
                  1 {inputToken} = {direction === "sol-to-usdc" 
                    ? formatPrice(priceData?.solUsd || 0) 
                    : formatPrice(1 / (priceData?.solUsd || 1), 6)} {outputToken}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Price Impact</span>
                <span className={swapOutput.priceImpact > 0.01 ? "text-orange-600" : "text-slate-700"}>
                  {(swapOutput.priceImpact * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Swap Fee (0.3%)</span>
                <span className="text-slate-700">
                  {swapOutput.fee.toFixed(direction === "sol-to-usdc" ? 6 : 2)} {inputToken}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Minimum Received</span>
                <span className="text-slate-900 font-medium">
                  {swapOutput.minimumReceived.toFixed(direction === "sol-to-usdc" ? 2 : 6)} {outputToken}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Slippage Setting */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Slippage Tolerance
            </span>
            <div className="flex gap-1">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSlippage(s)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    slippage === s
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {swapError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 pb-5"
            >
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{swapError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {swapSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 pb-5"
            >
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Swap successful! Check your balance.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap Button */}
        <div className="p-5 pt-0">
          <button
            onClick={executeSwap}
            disabled={
              !inputAmount || 
              parseFloat(inputAmount) <= 0 || 
              parseFloat(inputAmount) > inputBalance ||
              isSwapping ||
              !priceData
            }
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSwapping ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Swapping...
              </>
            ) : !isConnected ? (
              <>
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </>
            ) : parseFloat(inputAmount || "0") > inputBalance ? (
              `Insufficient ${inputToken} Balance`
            ) : (
              `Swap ${inputToken} → ${outputToken}`
            )}
          </button>
        </div>
      </div>

      {/* Simulation Badge */}
      {(solAdjustment !== 0 || usdcAdjustment !== 0) && (
        <div className="mt-4 bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 text-sm font-medium">
                🧪 Simulated Balance Active
              </span>
              <span className="text-xs text-amber-500">
                (SOL: {solAdjustment >= 0 ? '+' : ''}{solAdjustment.toFixed(4)}, USDC: {usdcAdjustment >= 0 ? '+' : ''}{usdcAdjustment.toFixed(2)})
              </span>
            </div>
            <button
              onClick={() => {
                setSolAdjustment(0);
                setUsdcAdjustment(0);
                setSwapAdjustment(SWAP_STORAGE_KEYS.SOL_ADJUSTMENT, 0);
                setSwapAdjustment(SWAP_STORAGE_KEYS.USDC_ADJUSTMENT, 0);
              }}
              className="text-xs text-amber-700 hover:text-amber-900 underline"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">💡 How Swap Works</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Real-time price from CoinGecko API</li>
              <li>• 0.3% swap fee (standard DEX rate)</li>
              <li>• Slippage protection for your trades</li>
              <li>• Simulated swap for devnet demo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
