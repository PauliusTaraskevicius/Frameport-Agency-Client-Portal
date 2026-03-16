import { caller } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workspaces = await caller.workspaces.getMany();

  if (workspaces.length === 0) {
    redirect("/dashboard/workspaces/create");
  } else {
    redirect(`/dashboard/workspaces/${workspaces[0].id}`);
  }
};

export default Page;
