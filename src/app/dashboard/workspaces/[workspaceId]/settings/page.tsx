import { auth } from "@clerk/nextjs/server";
import { caller } from "@/trpc/server";
import { UpdateWorkspaceForm } from "@/modules/workspaces/ui/components/UpdateWorkspaceForm";

import { redirect } from "next/navigation";

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

  const initialValues = await caller.workspaces.getOne({
    id: workspaceId,
  });

  if (!initialValues) {
    redirect(`/dashboard/workspaces/${workspaceId}`);
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-2xl p-4">
        <UpdateWorkspaceForm initialValues={initialValues} />
      </div>
    </div>
  );
};

export default WorkspaceIdSettingsPage;
