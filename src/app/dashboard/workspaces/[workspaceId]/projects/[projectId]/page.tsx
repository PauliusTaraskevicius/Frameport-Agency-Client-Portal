import { PageError } from "@/components/PageError";
import { Button } from "@/components/ui/button";
import { isMemberClient } from "@/modules/projects/hooks/is-member-client";
import { ProjectAvatar } from "@/modules/projects/ui/components/ProjectAvatar";
import { caller } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
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

  const initialValues = await caller.projects.getOne({
    projectId: projectId,
  });

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar name={initialValues.name} className="size-8" />
          <p className="text-lg font-semibold">{initialValues.name}</p>
        </div>
        <div>
          <Button variant="secondary" size="sm" asChild>
            <Link
              href={`/dashboard/workspaces/${initialValues.workspaceId}/projects/${initialValues.id}/settings`}
            >
              <PencilIcon className="mr-2 size-4" />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectIdPage;
