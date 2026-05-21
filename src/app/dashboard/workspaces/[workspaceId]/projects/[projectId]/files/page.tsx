import { FilesList } from "@/modules/files/ui/components/FilesList";
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

  return <FilesList projectId={projectId} />;
};

export default FilesPage;
