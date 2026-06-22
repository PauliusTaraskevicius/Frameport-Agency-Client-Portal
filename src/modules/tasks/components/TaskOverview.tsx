import { Button } from "@/components/ui/button";
import { Task } from "../types";
import { PencilIcon } from "lucide-react";
import { DottedSeparator } from "@/components/DottedSeparator";
import { OverviewProperty } from "./OverviewProperty";
import { TaskDate } from "./data-table/TaskDate";
import { Badge } from "@/components/ui/badge";
import { formatStatus } from "@/lib/utils";
import { useUpdateTaskModal } from "../hooks/use-update-task-modal";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import useGetRole from "@/modules/workspaces/api/use-get-role";

interface TaskOverviewProps {
  task: Task;
}

export const TaskOverview = ({ task }: TaskOverviewProps) => {
  const { open } = useUpdateTaskModal();
  const workspaceId = useWorkspaceId();
  const roleQuery = useGetRole({ workspaceId: workspaceId });
  const isClient = roleQuery.data?.isClient ?? false;

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Overview</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => open(task.id)}
            disabled={isClient}
            className="cursor-pointer"
          >
            <PencilIcon className="mr-2 size-4" />
            Edit
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <div className="flex flex-col gap-y-4">
          <OverviewProperty label="Assignee">
            <p className="text-sm font-medium">
              {task.assignee ? task.assignee.user.name : "Unassigned"}
            </p>
          </OverviewProperty>
          <OverviewProperty label="Due Date">
            <TaskDate
              value={task.dueDate.toISOString()}
              className="text-sm font-medium"
            />
          </OverviewProperty>
          <OverviewProperty label="Status">
            <Badge variant={task.status}>{formatStatus(task.status)}</Badge>
          </OverviewProperty>
        </div>
      </div>
    </div>
  );
};
