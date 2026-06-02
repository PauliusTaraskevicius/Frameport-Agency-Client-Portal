"use client";

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

interface ClientTaskIdPageProps {
  params: {
    taskId: string;
  };
}

export const ClientTaskIdPage = ({ params }: ClientTaskIdPageProps) => {
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
    </div>
  );
};
