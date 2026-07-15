'use client'

import { BillingPage } from "@/modules/billing/ui/components/BillingPage";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";

const Page = () => {
  const workspaceId = useWorkspaceId();
  return (
    <div>
      <BillingPage workspaceId={workspaceId} />
    </div>
  );
};

export default Page;
