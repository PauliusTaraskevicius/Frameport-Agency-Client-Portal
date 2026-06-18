import { FilesList } from "@/modules/files/ui/components/FilesList";
import { isMemberClient } from "@/modules/projects/hooks/is-member-client";
import { PageError } from "@/components/PageError";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface FilesPageProps {
  params: Promise<{
    projectId: string;
    workspaceId: string;
  }>;
}

const FilesPage = async ({ params }: FilesPageProps) => {
  const { projectId, workspaceId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { member, client } = await isMemberClient(workspaceId, projectId, userId);

  if (!member && !client) {
    return <PageError message="Project not found." />;
  }

  return <FilesList projectId={projectId} isClient={!member && !!client} />;
};

export default FilesPage;
