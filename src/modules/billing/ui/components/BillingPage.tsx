"use client";

import { useRouter } from "next/navigation";
import { PlanCard } from "./PlanCard";
import { useGetPlans } from "../../api/use-get-plans";
import { useGetSubscription } from "../../api/use-get-subscription";
import { useCreateCheckout } from "../../api/use-create-checkout";
import { useCreatePortal } from "../../api/use-create-portal";

interface BillingPageProps {
  workspaceId: string;
}

export const BillingPage = ({ workspaceId }: BillingPageProps) => {
  const router = useRouter();
  const { data: plans } = useGetPlans();
  const { data: subscription } = useGetSubscription({ workspaceId });
  const checkoutSession = useCreateCheckout();
  const portalSession = useCreatePortal();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing & Plans</h1>
      {subscription?.cancelAtPeriodEnd && (
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
          Your subscription will cancel on{" "}
          {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}
        </div>
      )}

      <div className="md:grid grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <PlanCard
            key={plan.key}
            name={plan.name}
            price={plan.price}
            currentPlan={subscription?.plan === plan.key}
            features={plan.features}
            onSelect={() =>
              checkoutSession.mutate({ workspaceId, priceId: plan.priceId })
            }
            onManage={
              subscription?.plan === plan.key
                ? () =>
                    portalSession.mutate({
                      workspaceId,
                    })
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};
