// =============================================================================
// PROTECTED ROUTE WRAPPER
// =============================================================================
// Redirects unauthenticated users to landing page
// =============================================================================

"use client";

import { useWallet } from "@lazorkit/wallet";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isConnected, isConnecting } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnecting && !isConnected) {
      router.push("/");
    }
  }, [isConnected, isConnecting, router, mounted]);

  // Server-side or not mounted yet
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Still connecting
  if (isConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-slate-600">Connecting wallet...</p>
      </div>
    );
  }

  // Not connected - redirect handled by useEffect
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-slate-600">Redirecting...</p>
      </div>
    );
  }

  // Connected - render children
  return <>{children}</>;
}
