import InvitationButton from "@/modules/invitations/ui/components/InvitationButton";
import { ClientWorkspaceIdPage } from "@/modules/workspaces/ui/components/ClientWorkspaceIdPage";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const WorkspaceIdPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <>
      <InvitationButton />
      <ClientWorkspaceIdPage />
    </>
  );
};

export default WorkspaceIdPage;
