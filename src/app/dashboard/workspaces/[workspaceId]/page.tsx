import InvitationButton from "@/modules/invitations/ui/components/InvitationButton";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const WorkspaceId = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <div><InvitationButton /></div>;
};

export default WorkspaceId;
