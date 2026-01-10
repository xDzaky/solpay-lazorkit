// =============================================================================
// QUICK ACTIONS COMPONENT
// =============================================================================
// Quick action buttons for dashboard
// =============================================================================

"use client";

import Link from "next/link";
import { Send, QrCode, RefreshCw, CreditCard, Users } from "lucide-react";

const actions = [
  { href: "/send", label: "Send", icon: Send, color: "bg-indigo-500" },
  { href: "/request", label: "Request", icon: QrCode, color: "bg-emerald-500" },
  { href: "/split", label: "Split Bill", icon: Users, color: "bg-orange-500" },
  { href: "/subscribe", label: "Subscribe", icon: CreditCard, color: "bg-purple-500" },
];

interface QuickActionsProps {
  onRefresh?: () => void;
}

export function QuickActions({ onRefresh }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all min-w-[80px]"
          >
            <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-slate-600">{action.label}</span>
          </Link>
        );
      })}
      
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all min-w-[80px]"
        >
          <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-medium text-slate-600">Refresh</span>
        </button>
      )}
    </div>
  );
}
