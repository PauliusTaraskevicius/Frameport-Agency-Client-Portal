"use client";

import { PageLoader } from "@/components/PageLoader";
import { useGetTask } from "../api/use-get-task";
import { PageError } from "@/components/PageError";
import { TaskBreadcrumbs } from "./TaskBreadcrumbs";
import { DottedSeparator } from "@/components/DottedSeparator";
import { TaskOverview } from "./TaskOverview";
import { TaskDescription } from "./TaskDescription";

interface ClientTaskIdPageProps {
  params: {
    taskId: string;
  };
}

export const ClientTaskIdPage = ({ params }: ClientTaskIdPageProps) => {
  const {
    data: task,
    isLoading,
  } = useGetTask({ taskId: params.taskId });

  if (isLoading) {
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
      </div>
    </div>
  );
};
