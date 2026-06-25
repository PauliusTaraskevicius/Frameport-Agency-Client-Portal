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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useGetRole from "@/modules/workspaces/api/use-get-role";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFeed } from "@/modules/activity/ui/components/ActivityFeed";
import { useGetProjectActivity } from "@/modules/activity/api/use-get-project-activity";

interface ClientProjectIdPageProps {
  params: {
    projectId: string;
    workspaceId: string;
  };
  isClient?: boolean;
}
export const ClientProjectIdPage = ({
  params,
  isClient,
}: ClientProjectIdPageProps) => {
  const { projectId, workspaceId } = params;
  const [showUpload, setShowUpload] = useState(false);
  const [activityPage, setActivityPage] = useState(1);

  const isMobile = useIsMobile();
  const roleQuery = useGetRole({ workspaceId: workspaceId });
  const getProject = useGetProject({ projectId });
  const getProjectAnalytics = useGetProjectAnalytics({ projectId });
  const getFiles = useGetFiles({ projectId });
  const getActivity = useGetProjectActivity({
    projectId,
    page: activityPage,
    limit: 10,
  });

  if (!getProject.data || !getProjectAnalytics.data) {
    return null;
  }

  const isClientRole = roleQuery.data?.isClient ?? false;

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
                  <DropdownMenuItem disabled={isClientRole}>
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
              {(!isClient || getFiles.data?.length) && (
                <DropdownMenuSeparator />
              )}
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
                  className="cursor-pointer"
                >
                  {showUpload ? (
                    <X className="mr-1 size-4" />
                  ) : (
                    <FileIcon className="mr-1 size-4" />
                  )}
                  {showUpload ? "Close" : "Add files"}
                </Button>

                {isClientRole ? (
                  <Button variant="secondary" size="sm" disabled>
                    <PencilIcon className="mr-1 size-4" />
                    Edit Project
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" asChild>
                    <Link
                      href={`/dashboard/workspaces/${workspaceId}/projects/${projectId}/settings`}
                    >
                      <PencilIcon className="mr-1 size-4" />
                      Edit Project
                    </Link>
                  </Button>
                )}
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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger
            value="overview"
            className="h-8 w-full cursor-pointer lg:w-auto"
          >
            Overview
          </TabsTrigger>
          {!isClient && (
            <TabsTrigger
              value="activity"
              className="h-8 w-full cursor-pointer lg:w-auto"
            >
              Activity
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {getProjectAnalytics.data ? (
            <Analytics data={getProjectAnalytics.data} />
          ) : null}

          <TasksViewSwitcher
            hideProjectFilter
            projectId={projectId}
            isClient={isClient}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="mb-4 text-lg font-semibold">Activity</p>
            <ActivityFeed
              logs={getActivity.data?.logs ?? []}
              totalPages={getActivity.data?.totalPages ?? 0}
              currentPage={getActivity.data?.currentPage ?? 1}
              onPageChange={setActivityPage}
              isLoading={getActivity.isLoading}
              error={getActivity.error}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
