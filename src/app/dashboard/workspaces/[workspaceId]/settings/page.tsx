import { auth } from "@clerk/nextjs/server";
import { caller } from "@/trpc/server";
import { UpdateWorkspaceForm } from "@/modules/workspaces/ui/components/UpdateWorkspaceForm";
import { ClientSettingsTabs } from "@/modules/settings/ui/components/ClientSettingsTabs";

import { redirect } from "next/navigation";
import { PageError } from "@/components/PageError";

interface WorkspaceIdSettingsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

const WorkspaceIdSettingsPage = async ({
  params,
}: WorkspaceIdSettingsPageProps) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { workspaceId } = await params;

  const workspace = await caller.workspaces.getOne({ id: workspaceId });

  if (!workspace) {
    return <PageError message="Workspace not found." />;
  }

  return (
    <div className="flex w-full items-center justify-center">
      <ClientSettingsTabs workspace={workspace} />
    </div>
  );
};

export default WorkspaceIdSettingsPage;
