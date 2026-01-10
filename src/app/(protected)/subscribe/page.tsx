// =============================================================================
// SUBSCRIBE PAGE
// =============================================================================
// Subscription plans selection (uses existing Pricing component)
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { Pricing } from "@/components/Pricing";
import { SubscriptionDashboard } from "@/components/SubscriptionDashboard";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { MOCK_MODE, getMockSubscription } from "@/lib/mock-mode";

export default function SubscribePage() {
  const { currentSubscription, isLoading } = useSubscriptionStore();
  const [mockSubscription, setMockSubscription] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check mock subscription
  useEffect(() => {
    if (!MOCK_MODE) return;
    
    const update = () => {
      setMockSubscription(getMockSubscription());
    };
    update();
    
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeSubscription = MOCK_MODE ? mockSubscription : currentSubscription;

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 max-w-6xl mx-auto">
        <Link 
          href="/dashboard"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscribe</h1>
          <p className="text-slate-500 text-sm">Choose a plan that works for you</p>
        </div>
      </div>

      {/* Show Dashboard if subscribed, otherwise show pricing */}
      {activeSubscription ? (
        <SubscriptionDashboard />
      ) : (
        <>
          {/* Benefits Banner */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Why Subscribe?</h2>
                  <ul className="text-white/90 space-y-1 text-sm">
                    <li>✓ Zero gas fees on all transactions</li>
                    <li>✓ Priority transaction processing</li>
                    <li>✓ Advanced analytics and reporting</li>
                    <li>✓ Premium support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Component */}
          <Pricing />

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mt-12">
            <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-medium text-slate-900 mb-2">
                  How does gasless transactions work?
                </h3>
                <p className="text-slate-600 text-sm">
                  With Lazorkit's infrastructure, all transaction fees are sponsored by SolPay. 
                  This means you can send and receive without worrying about having SOL for gas.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-medium text-slate-900 mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-slate-600 text-sm">
                  Yes! You can cancel your subscription at any time. Your benefits will remain 
                  active until the end of your billing period.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-medium text-slate-900 mb-2">
                  What payment methods are accepted?
                </h3>
                <p className="text-slate-600 text-sm">
                  We accept USDC payments directly from your Lazorkit wallet. Simply approve 
                  the transaction with your passkey.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
