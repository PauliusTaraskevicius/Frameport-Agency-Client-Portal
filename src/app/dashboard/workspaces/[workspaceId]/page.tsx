import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const WorkspaceId = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <div>WorkspaceId</div>;
};

export default WorkspaceId;
