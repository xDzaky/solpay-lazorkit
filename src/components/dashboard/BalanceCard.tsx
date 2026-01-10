// =============================================================================
// BALANCE CARD COMPONENT
// =============================================================================
// Displays SOL or USDC balance with icon
// =============================================================================

"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface BalanceCardProps {
  token: "SOL" | "USDC";
  balance: number;
  isLoading?: boolean;
  isMock?: boolean;
}

export function BalanceCard({ token, balance, isLoading, isMock }: BalanceCardProps) {
  const formatBalance = (bal: number) => {
    if (token === "USDC") {
      return `$${bal.toFixed(2)}`;
    }
    return `${bal.toFixed(4)} SOL`;
  };

  return (
    <div className={cn(
      "p-6 rounded-2xl border transition-all",
      token === "SOL" 
        ? "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100" 
        : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {token === "SOL" ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">◎</span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">$</span>
            </div>
          )}
          <div>
            <p className="font-medium text-slate-900">{token}</p>
            <p className="text-xs text-slate-500">
              {token === "SOL" ? "Solana" : "USD Coin"}
            </p>
          </div>
        </div>
        {isMock && (
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
            Mock
          </span>
        )}
      </div>
      
      <div className="flex items-end gap-2">
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        ) : (
          <p className={cn(
            "text-2xl font-bold",
            token === "SOL" ? "text-purple-700" : "text-emerald-700"
          )}>
            {formatBalance(balance)}
          </p>
        )}
      </div>
    </div>
  );
}
