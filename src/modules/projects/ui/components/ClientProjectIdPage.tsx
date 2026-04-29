"use client";

import { Button } from "@/components/ui/button";
import useGetProject from "@/modules/projects/api/use-get-project";
import { ProjectAvatar } from "@/modules/projects/ui/components/ProjectAvatar";
import { TasksViewSwitcher } from "@/modules/tasks/components/TasksViewSwitcher";
import { PencilIcon } from "lucide-react";
import Link from "next/link";

interface ClientProjectIdPageProps {
  params: {
    projectId: string;
    workspaceId: string;
  };
}
export const ClientProjectIdPage = ({ params }: ClientProjectIdPageProps) => {
  const { projectId, workspaceId } = params;

  const getProject = useGetProject({ projectId });

  if (!getProject.data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar name={getProject.data.name} className="size-8" />
          <p className="text-lg font-semibold">{getProject.data.name}</p>
        </div>
        <div>
          <Button variant="secondary" size="sm" asChild>
            <Link
              href={`/dashboard/workspaces/${workspaceId}/projects/${projectId}/settings`}
            >
              <PencilIcon className="mr-2 size-4" />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>
      <TasksViewSwitcher hideProjectFilter />
    </div>
  );
};
