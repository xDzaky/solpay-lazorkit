// =============================================================================
// PROTECTED LAYOUT
// =============================================================================
// Layout wrapper for all protected (authenticated) pages
// =============================================================================

"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { MockModeIndicator } from "@/components/MockModeIndicator";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <MockModeIndicator />
        
        <div className="flex">
          {/* Desktop Sidebar */}
          <DashboardSidebar />
          
          {/* Main Content */}
          <main className="flex-1 pb-20 lg:pb-0 lg:pl-64">
            {children}
          </main>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </ProtectedRoute>
  );
}
