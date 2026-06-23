import { PageError } from "@/components/PageError";
import { isMemberClient } from "@/modules/projects/hooks/is-member-client";
import { ClientProjectIdPage } from "@/modules/projects/ui/components/ClientProjectIdPage";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ProjectIdPageProps {
  params: {
    workspaceId: string;
    projectId: string;
  };
}

const ProjectIdPage = async ({ params }: ProjectIdPageProps) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { workspaceId, projectId } = await params;

  const { member, client } = await isMemberClient(
    workspaceId,
    projectId,
    userId,
  );

  if (!member && !client) {
    return <PageError message="Project not found." />;
  }

  const isClient = member?.role === "CLIENT" || !!client;

  return <ClientProjectIdPage params={{ projectId, workspaceId }} isClient={isClient} />;
};

export default ProjectIdPage;
