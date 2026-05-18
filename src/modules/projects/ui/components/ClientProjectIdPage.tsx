"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import useGetProject from "@/modules/projects/api/use-get-project";
import { ProjectAvatar } from "@/modules/projects/ui/components/ProjectAvatar";
import { TasksViewSwitcher } from "@/modules/tasks/components/TasksViewSwitcher";
import { FileIcon, PencilIcon, X } from "lucide-react";
import Link from "next/link";
import useGetProjectAnalytics from "../../api/use-get-project-analytics";
import { Analytics } from "@/components/Analytics";
import { FileUpload } from "./FileUpload";

interface ClientProjectIdPageProps {
  params: {
    projectId: string;
    workspaceId: string;
  };
}
export const ClientProjectIdPage = ({ params }: ClientProjectIdPageProps) => {
  const { projectId, workspaceId } = params;
  const [showUpload, setShowUpload] = useState(false);

  const getProject = useGetProject({ projectId });
  const getProjectAnalytics = useGetProjectAnalytics({ projectId });

  if (!getProject.data || !getProjectAnalytics.data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar name={getProject.data.name} className="size-8" />
          <p className="hidden text-lg font-semibold md:block">
            {getProject.data.name}
          </p>
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowUpload((v) => !v)}
          >
            {showUpload ? (
              <X className="mr-2 size-4" />
            ) : (
              <FileIcon className="mr-2 size-4" />
            )}
            {showUpload ? "Close" : "Add files"}
          </Button>
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

      {showUpload && (
        <div className="rounded-lg border p-4">
          <p className="mb-3 text-sm font-medium">Upload files</p>
          <FileUpload
            projectId={projectId}
            onSuccess={() => setShowUpload(false)}
          />
        </div>
      )}

      {getProjectAnalytics.data ? (
        <Analytics data={getProjectAnalytics.data} />
      ) : null}

      <TasksViewSwitcher hideProjectFilter projectId={projectId} />
    </div>
  );
};
