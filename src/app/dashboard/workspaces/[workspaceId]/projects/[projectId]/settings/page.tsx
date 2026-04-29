import { PageError } from "@/components/PageError";
import { isMemberClient } from "@/modules/projects/hooks/is-member-client";
import { ProjectIdSettingsClient } from "@/modules/projects/ui/components/ProjectIdSettingsClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ProjectSettingsPageProps {
  params: Promise<{
    workspaceId: string;
    projectId: string;
  }>;
}

const ProjectSettingsPage = async ({ params }: ProjectSettingsPageProps) => {
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

  return <ProjectIdSettingsClient projectId={projectId} />;
};

export default ProjectSettingsPage;
