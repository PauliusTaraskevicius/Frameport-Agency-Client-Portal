"use client";

import { useState } from "react";
import { PageLoader } from "@/components/PageLoader";
import { useGetTask } from "../api/use-get-task";
import { PageError } from "@/components/PageError";
import { TaskBreadcrumbs } from "./TaskBreadcrumbs";
import { DottedSeparator } from "@/components/DottedSeparator";
import { TaskOverview } from "./TaskOverview";
import { TaskDescription } from "./TaskDescription";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useGetTaskComments } from "../api/use-get-task-comments";
import { useCreateComment } from "../api/use-create-comment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFeed } from "@/modules/activity/ui/components/ActivityFeed";
import { useGetTaskActivity } from "@/modules/activity/api/use-get-task-activity";
import useGetRole from "@/modules/workspaces/api/use-get-role";

interface ClientTaskIdPageProps {
  params: {
    taskId: string;
  };
}

export const ClientTaskIdPage = ({ params }: ClientTaskIdPageProps) => {
  const [activityPage, setActivityPage] = useState(1);

  const { data: task, isLoading: isTaskLoading } = useGetTask({
    taskId: params.taskId,
  });
  const { data: comments, isLoading: isCommentsLoading } = useGetTaskComments({
    taskId: params.taskId,
    projectId: task?.project.id ?? "",
  });
  const createTaskCommentMutation = useCreateComment(
    params.taskId,
    task?.project.id ?? "",
  );

  const getActivity = useGetTaskActivity({
    taskId: params.taskId,
    page: activityPage,
    limit: 10,
  });

  const roleQuery = useGetRole({
    workspaceId: task?.project.workspaceId ?? "",
  });
  const isClient = roleQuery.data?.isClient ?? false;

  if (isTaskLoading || isCommentsLoading) {
    return <PageLoader />;
  }

  if (!task) {
    return <PageError message="Task not found" />;
  }

  return (
    <div className="flex flex-col">
      <TaskBreadcrumbs task={task} project={task.project} />
      <DottedSeparator className="my-6" />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger
            value="details"
            className="h-8 w-full cursor-pointer lg:w-auto"
          >
            Details
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

        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TaskOverview task={task} />
            <TaskDescription task={task} />
            <CommentsSection
              comments={comments ?? []}
              onSubmit={async (body, parentId) => {
                await createTaskCommentMutation.mutateAsync({
                  projectId: task.project.id,
                  taskId: task.id,
                  body,
                  parentId,
                });
              }}
            />
          </div>
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
