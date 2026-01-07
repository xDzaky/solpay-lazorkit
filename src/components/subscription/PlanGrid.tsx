// =============================================================================
// PLAN GRID COMPONENT
// =============================================================================
// Displays a grid of subscription plans.
// =============================================================================

"use client";

import { PlanCard, type Plan } from "./PlanCard";

// =============================================================================
// TYPES
// =============================================================================

interface PlanGridProps {
  plans: Plan[];
  currentPlanId?: string;
  onSubscribe?: (plan: Plan, signature: string) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * PlanGrid
 * 
 * Displays subscription plans in a responsive grid layout.
 * 
 * @example
 * ```tsx
 * <PlanGrid 
 *   plans={plans}
 *   currentPlanId="plan_pro"
 *   onSubscribe={(plan, sig) => handleSubscription(plan, sig)}
 * />
 * ```
 */
export function PlanGrid({ plans, currentPlanId, onSubscribe }: PlanGridProps) {
  // Sort plans by sortOrder if available
  const sortedPlans = [...plans].sort((a, b) => {
    // Highlighted plans should be in the middle for visual balance
    if (a.isHighlighted && !b.isHighlighted) return 0;
    if (!a.isHighlighted && b.isHighlighted) return 0;
    return 0;
  });

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center">
        {sortedPlans.map((plan) => (
          <div key={plan.id} className="w-full max-w-sm">
            <PlanCard
              plan={plan}
              isCurrentPlan={plan.id === currentPlanId}
              onSubscribe={onSubscribe}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlanGrid;
