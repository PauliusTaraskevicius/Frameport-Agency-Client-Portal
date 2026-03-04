import { CreateWorkspaceForm } from "@/modules/workspaces/ui/components/CreateWorkspaceForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <CreateWorkspaceForm />
    </div>
  );
};

export default Page;
