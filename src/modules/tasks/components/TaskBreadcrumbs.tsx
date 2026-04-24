import { Project } from "@/generated/prisma/client";
import { Task } from "../types";
import { ProjectAvatar } from "@/modules/projects/ui/components/ProjectAvatar";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import Link from "next/link";
import { ChevronRightIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteTask } from "../api/use-delete-task";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";

interface TaskBreadcrumbsProps {
  project: Project;
  task: Task;
}

export const TaskBreadcrumbs = ({ task, project }: TaskBreadcrumbsProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Task",
    "This action cannot be undone",
  );
  const useDeleteTaskMutation = useDeleteTask({
    workspaceId,
    projectId: project.id,
  });

  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) return;

    useDeleteTaskMutation.mutate({ taskId: task.id });
    router.push(`/dashboard/workspaces/${workspaceId}/tasks`);
  };

  return (
    <div className="flex items-center gap-x-2">
      <ConfirmDialog />
      <ProjectAvatar name={project.name} className="size-6 lg:size-8" />
      <Link
        href={`/dashboard/workspaces/${workspaceId}/projects/${project.id}`}
      >
        <p className="text-muted-foreground text-sm font-semibold transition hover:opacity-75 lg:text-lg">
          {project.name}
        </p>
      </Link>
      <ChevronRightIcon className="text-muted-foreground size-4 lg:size-5" />
      <p className="text-sm font-semibold lg:text-lg">{task.title}</p>
      <Button
        className="ml-auto"
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={useDeleteTaskMutation.isPending}
      >
        <TrashIcon className="size-4 lg:mr-2" />
        <span className="hidden lg:block">Delete Task</span>
      </Button>
    </div>
  );
};
