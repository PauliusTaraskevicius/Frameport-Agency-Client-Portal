import ClientFileIdPage from "@/modules/files/ui/components/ClientFileIdPage";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface FileIdPageProps {
  params: {
    fileId: string;
    projectId: string;
    workspaceId: string;
  };
}

const FileIdPage = async ({ params }: FileIdPageProps) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <ClientFileIdPage params={params} />
    </div>
  );
};

export default FileIdPage;
