"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import useGetProject from "@/modules/projects/api/use-get-project";
import { ProjectAvatar } from "@/modules/projects/ui/components/ProjectAvatar";
import { TasksViewSwitcher } from "@/modules/tasks/components/TasksViewSwitcher";
import { FileIcon, FilesIcon, PencilIcon, X } from "lucide-react";
import Link from "next/link";
import useGetProjectAnalytics from "../../api/use-get-project-analytics";
import { Analytics } from "@/components/Analytics";
import { FileUpload } from "../../../files/ui/components/FileUpload";
import { useGetFiles } from "@/modules/files/api/use-get-files";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientProjectIdPageProps {
  params: {
    projectId: string;
    workspaceId: string;
  };
  isClient?: boolean;
}
export const ClientProjectIdPage = ({ params, isClient }: ClientProjectIdPageProps) => {
  const { projectId, workspaceId } = params;
  const [showUpload, setShowUpload] = useState(false);

  const isMobile = useIsMobile();

  const getProject = useGetProject({ projectId });
  const getProjectAnalytics = useGetProjectAnalytics({ projectId });
  const getFiles = useGetFiles({ projectId });

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

        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {!isClient && (
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="flex items-center"
                    onClick={() => setShowUpload((v) => !v)}
                  >
                    {" "}
                    {showUpload ? (
                      <X className="mr-1 size-4" />
                    ) : (
                      <FileIcon className="mr-1 size-4" />
                    )}
                    {showUpload ? "Close" : "Add files"}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    {" "}
                    <Link
                      className="flex items-center"
                      href={`/dashboard/workspaces/${workspaceId}/projects/${projectId}/settings`}
                    >
                      <PencilIcon className="mr-1 size-4" />
                      Edit Project
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              )}
              {(!isClient || getFiles.data?.length) && <DropdownMenuSeparator />}
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  {" "}
                  <Link
                    className="flex items-center"
                    href={`/dashboard/workspaces/${workspaceId}/projects/${projectId}/files`}
                  >
                    <FilesIcon className="mr-1 size-4" />
                    {getFiles.data?.length || 0} files
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-x-2">
            {!isClient && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowUpload((v) => !v)}
                >
                  {showUpload ? (
                    <X className="mr-1 size-4" />
                  ) : (
                    <FileIcon className="mr-1 size-4" />
                  )}
                  {showUpload ? "Close" : "Add files"}
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link
                    href={`/dashboard/workspaces/${workspaceId}/projects/${projectId}/settings`}
                  >
                    <PencilIcon className="mr-1 size-4" />
                    Edit Project
                  </Link>
                </Button>
              </>
            )}
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/dashboard/workspaces/${workspaceId}/projects/${projectId}/files`}
              >
                <FilesIcon className="mr-1 size-4" />
                {getFiles.data?.length || 0} files
              </Link>
            </Button>
          </div>
        )}
      </div>

      {showUpload && !isClient && (
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

      <TasksViewSwitcher hideProjectFilter projectId={projectId} isClient={isClient} />
    </div>
  );
};
