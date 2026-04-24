import { useState } from "react";
import { Dot, PencilIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DottedSeparator } from "@/components/DottedSeparator";

import { Task } from "../types";
import { useUpdateTask } from "../api/use-update-task";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";

interface TaskDescriptionProps {
  task: Task;
}

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
  const workspaceId = useWorkspaceId();

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.description || "");
  const useUpdateTaskMutation = useUpdateTask({
    workspaceId,
    projectId: task.projectId,
  });

  const handleSave = () => {
    useUpdateTaskMutation.mutate({
      taskId: task.id,
      description: value,
    });
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Overview</p>
        <Button
          size="sm"
          value="secondary"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? (
            <XIcon className="mr-2 size-4" />
          ) : (
            <PencilIcon className="mr-2 size-4" />
          )}
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>
      <DottedSeparator className="my-4" />
      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            placeholder="Add a description..."
            value={value}
            rows={4}
            onChange={(e) => setValue(e.target.value)}
            disabled={useUpdateTaskMutation.isPending}
          />
          <Button
            onClick={handleSave}
            disabled={useUpdateTaskMutation.isPending}
            size="sm"
            className="ml-auto w-fit"
          >
            {useUpdateTaskMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      ) : (
        <div>
          {task.description || (
            <span className="text-muted-foreground">No description set</span>
          )}
        </div>
      )}
    </div>
  );
};
