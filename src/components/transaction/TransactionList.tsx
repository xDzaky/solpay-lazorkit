// =============================================================================
// TRANSACTION LIST COMPONENT
// =============================================================================
// Displays a list of user transactions with status indicators.
// Supports mock mode for testing.
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsdc, formatDateTime, formatSignature } from "@/lib/utils";
import { getExplorerUrl } from "@/lib/constants";
import { MOCK_MODE, getMockTransactions, type MockTransaction } from "@/lib/mock-mode";
import { ExternalLink, ArrowUpRight, ArrowDownLeft, RefreshCw, Beaker } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export interface Transaction {
  id: string;
  signature: string;
  amount: number;
  token: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  type: "SUBSCRIPTION_PAYMENT" | "ONE_TIME_PAYMENT" | "REFUND";
  createdAt: string;
  confirmedAt?: string | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

// =============================================================================
// STATUS CONFIG
// =============================================================================

const statusConfig = {
  PENDING: { variant: "warning" as const, label: "Pending" },
  CONFIRMED: { variant: "success" as const, label: "Confirmed" },
  FAILED: { variant: "error" as const, label: "Failed" },
};

const typeConfig = {
  SUBSCRIPTION_PAYMENT: { icon: ArrowUpRight, label: "Subscription" },
  ONE_TIME_PAYMENT: { icon: ArrowUpRight, label: "Payment" },
  REFUND: { icon: ArrowDownLeft, label: "Refund" },
};

// =============================================================================
// TRANSACTION ITEM
// =============================================================================

function TransactionItem({ transaction, isMock = false }: { transaction: Transaction; isMock?: boolean }) {
  const status = statusConfig[transaction.status];
  const type = typeConfig[transaction.type];
  const TypeIcon = type.icon;

  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0">
      {/* Left: Type & Signature */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-secondary">
          <TypeIcon className="w-4 h-4" />
        </div>
        <div>
          <p className="font-medium">{type.label}</p>
          {isMock ? (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              {formatSignature(transaction.signature)}
              <Badge variant="outline" className="text-[10px] px-1">Mock</Badge>
            </span>
          ) : (
            <a
              href={getExplorerUrl("tx", transaction.signature)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {formatSignature(transaction.signature)}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Right: Amount & Status */}
      <div className="text-right">
        <p className="font-medium">
          {transaction.type === "REFUND" ? "+" : "-"}
          {formatUsdc(transaction.amount)}
        </p>
        <div className="flex items-center gap-2 justify-end">
          <span className="text-sm text-muted-foreground">
            {formatDateTime(transaction.createdAt)}
          </span>
          <Badge variant={status.variant} className="text-xs">
            {status.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between py-4 border-b animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary" />
        <div>
          <div className="h-4 w-24 bg-secondary rounded mb-2" />
          <div className="h-3 w-32 bg-secondary rounded" />
        </div>
      </div>
      <div className="text-right">
        <div className="h-4 w-20 bg-secondary rounded mb-2 ml-auto" />
        <div className="h-3 w-24 bg-secondary rounded ml-auto" />
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * TransactionList
 * 
 * Displays a list of transactions with:
 * - Transaction type icon
 * - Signature with explorer link
 * - Amount in USDC
 * - Status badge
 * - Timestamp
 * 
 * @example
 * ```tsx
 * <TransactionList 
 *   transactions={userTransactions}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  // Track mock transactions for real-time updates
  const [mockTransactions, setMockTransactions] = useState<MockTransaction[]>([]);

  // Poll for mock transactions in mock mode
  useEffect(() => {
    if (!MOCK_MODE) return;

    const updateMockTx = () => {
      setMockTransactions(getMockTransactions());
    };

    updateMockTx();
    const interval = setInterval(updateMockTx, 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert mock transactions to display format
  const displayTransactions: Transaction[] = MOCK_MODE 
    ? mockTransactions.map(tx => ({
        id: tx.id,
        signature: tx.signature,
        amount: tx.amount,
        token: tx.token,
        status: (tx.status === 'confirmed' || tx.status === 'SUCCESS') ? 'CONFIRMED' : (tx.status === 'pending' || tx.status === 'PENDING') ? 'PENDING' : 'FAILED',
        type: 'SUBSCRIPTION_PAYMENT' as const,
        createdAt: tx.createdAt ? new Date(tx.createdAt).toISOString() : tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString(),
        confirmedAt: (tx.status === 'confirmed' || tx.status === 'SUCCESS') 
          ? (tx.createdAt ? new Date(tx.createdAt).toISOString() : tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString()) 
          : null,
      }))
    : transactions;

  // Loading state
  if (isLoading && !MOCK_MODE) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <TransactionSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (displayTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Transaction History
            {MOCK_MODE && <Beaker className="w-4 h-4 text-yellow-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions yet</p>
            <p className="text-sm mt-1">
              {MOCK_MODE 
                ? "Subscribe to a plan to create mock transactions!" 
                : "Subscribe to a plan to see your first transaction!"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transaction list
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Transaction History
          {MOCK_MODE && (
            <Badge variant="warning" className="text-xs">
              <Beaker className="w-3 h-3 mr-1" />
              Mock
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayTransactions.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} isMock={MOCK_MODE} />
        ))}
      </CardContent>
    </Card>
  );
}

export default TransactionList;
