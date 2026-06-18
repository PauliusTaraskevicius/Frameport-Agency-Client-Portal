import { ExternalLink, PencilIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { useConfirm } from "@/hooks/use-confirm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import { useDeleteTask } from "../api/use-delete-task";
import { useUpdateTaskModal } from "../hooks/use-update-task-modal";

interface TaskActionsProps {
  id: string;
  projectId: string;
  children: React.ReactNode;
  isClient?: boolean;
}

export const TaskActions = ({ id, projectId, children, isClient }: TaskActionsProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { open } = useUpdateTaskModal();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Task",
    "This action cannot be undone.",
  );

  const deleteTaskMutation = useDeleteTask({ workspaceId, projectId });

  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) return;

    deleteTaskMutation.mutate({ taskId: id });
  };

  const onOpenTask = () => {
    router.push(`/dashboard/workspaces/${workspaceId}/tasks/${id}`);
  };

  const onOpenProject = () => {
    router.push(`/dashboard/workspaces/${workspaceId}/projects/${projectId}`);
  };

  return (
    <div className="flex justify-end">
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onOpenTask} className="p-2.5 font-medium">
            <ExternalLink className="mr-2 size-4 stroke-2" />
            Task Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onOpenProject}
            className="p-2.5 font-medium"
          >
            <ExternalLink className="mr-2 size-4 stroke-2" />
            Open Project
          </DropdownMenuItem>
          {!isClient && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  open(id);
                }}
                className="p-2.5 font-medium"
              >
                <PencilIcon className="mr-2 size-4 stroke-2" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                disabled={deleteTaskMutation.isPending}
                className="p-2.5 font-medium text-amber-700 focus:text-amber-700"
              >
                <TrashIcon className="mr-2 size-4 stroke-2" />
                Delete Task
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
