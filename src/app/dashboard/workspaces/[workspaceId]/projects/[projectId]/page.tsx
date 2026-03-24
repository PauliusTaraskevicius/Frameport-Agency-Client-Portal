import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const ProjectIdPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <div>ProjectIdPage</div>;
};

export default ProjectIdPage;
