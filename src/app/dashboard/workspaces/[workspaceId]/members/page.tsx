import { MembersList } from "@/modules/workspaces/ui/components/MembersList";
import { auth } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";

const WorkspaceIdMembersPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <MembersList />
    </div>
  );
};

export default WorkspaceIdMembersPage;
