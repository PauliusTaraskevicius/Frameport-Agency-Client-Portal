import { MoreHorizontal } from "lucide-react";
import { Task } from "../../types";
import { TaskActions } from "../TaskAction";
import { DottedSeparator } from "@/components/DottedSeparator";
import { TaskDate } from "./TaskDate";
import { ProjectAvatar } from "@/modules/projects/ui/components/ProjectAvatar";

interface KanbanCardProps {
  task: Task;
  isClient?: boolean;
}

export const KanbanCard = ({ task, isClient }: KanbanCardProps) => {
  return (
    <div className="mb-1.5 space-y-3 rounded bg-white p-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-x-2">
        <p className="line-clamp-2 text-sm">{task.title}</p>
        <TaskActions id={task.id} projectId={task.projectId} isClient={isClient}>
          <MoreHorizontal className="size-4.5 shrink-0 stroke-1 text-neutral-700 transition hover:opacity-75 cursor-pointer" />
        </TaskActions>
      </div>
      <DottedSeparator />
      <div className="flex items-center gap-x-1.5">
        <p>{task.assignee ? task.assignee.user.name : "Unassigned"}</p>
        <div className="size-1 rounded-full bg-neutral-300" />
        <TaskDate value={task.dueDate.toISOString()} className="text-xs" />
      </div>
      <div className="flex items-center gap-x-1.5">
        <ProjectAvatar
          name={task.project.name}
          fallbackClassName="text-[10px]"
        />
        <span className="text-xs font-medium">{task.project.name}</span>
      </div>
    </div>
  );
};
