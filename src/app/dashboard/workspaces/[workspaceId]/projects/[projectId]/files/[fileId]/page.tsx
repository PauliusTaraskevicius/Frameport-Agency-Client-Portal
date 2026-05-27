import ClientFileIdPage from "@/modules/files/ui/components/ClientFileIdPage";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface FileIdPageProps {
  params: Promise<{
    fileId: string;
    projectId: string;
    workspaceId: string;
  }>;
}

const FileIdPage = async ({ params }: FileIdPageProps) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { fileId, projectId, workspaceId } = await params;

  return (
    <div>
      <ClientFileIdPage params={{ fileId, projectId, workspaceId }} />
    </div>
  );
};

export default FileIdPage;
