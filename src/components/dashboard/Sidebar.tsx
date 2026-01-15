// =============================================================================
// DASHBOARD SIDEBAR
// =============================================================================
// Navigation sidebar for dashboard pages
// =============================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@lazorkit/wallet";
import { 
  LayoutDashboard, 
  Send, 
  QrCode, 
  History, 
  Settings,
  CreditCard,
  LogOut,
  Wallet,
  Users,
  Store,
  ArrowLeftRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/send", label: "Send", icon: Send },
  { href: "/request", label: "Request", icon: QrCode },
  { href: "/swap", label: "Swap", icon: ArrowLeftRight },
  { href: "/split", label: "Split Bill", icon: Users },
  { href: "/transactions", label: "History", icon: History },
  { href: "/subscribe", label: "Subscribe", icon: CreditCard },
  { href: "/merchant", label: "Merchant", icon: Store },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { disconnect, smartWalletPubkey } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg text-slate-900">SolPay</span>
        </Link>
      </div>

      {/* Wallet Info */}
      {smartWalletPubkey && (
        <div className="p-4 mx-4 mt-4 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Connected Wallet</p>
          <p className="font-mono text-sm text-slate-700">
            {formatAddress(smartWalletPubkey.toString())}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Disconnect Button */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
