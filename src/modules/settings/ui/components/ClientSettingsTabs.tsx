"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpdateWorkspaceForm } from "@/modules/workspaces/ui/components/UpdateWorkspaceForm";
import { BillingPage } from "@/modules/billing/ui/components/BillingPage";
import { Workspace } from "@/generated/prisma/client";
import { useQueryState } from "nuqs";
import { DottedSeparator } from "@/components/DottedSeparator";

interface ClientSettingsTabsProps {
  workspace: Workspace;
}

export const ClientSettingsTabs = ({ workspace }: ClientSettingsTabsProps) => {
  const [tab, setTab] = useQueryState("tab", { defaultValue: "general" });

  return (
    <div className="flex flex-col">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full lg:w-auto">
          <TabsTrigger
            className="h-8 w-full cursor-pointer lg:w-auto"
            value="general"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            className="h-8 w-full cursor-pointer lg:w-auto"
            value="billing"
          >
            Billing
          </TabsTrigger>
        </TabsList>

        <DottedSeparator className="my-4" />

        <TabsContent value="general">
          <div className="w-full max-w-2xl p-4">
            <UpdateWorkspaceForm initialValues={workspace} />
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <BillingPage workspaceId={workspace.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
