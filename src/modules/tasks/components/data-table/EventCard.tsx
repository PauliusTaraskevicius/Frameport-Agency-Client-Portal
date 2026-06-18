import { Project, WorkspaceMember } from "@/generated/prisma/client";

import { TaskStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { ProjectAvatar } from "@/modules/projects/ui/components/ProjectAvatar";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EventCardProps {
  id: string;
  title: string;
  assignee: (WorkspaceMember & { user: { name: string } }) | null;
  project: Project;
  status: TaskStatus;
}

const statusColor: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: "border-l-red-500",
  [TaskStatus.IN_PROGRESS]: "border-l-yellow-500",
  [TaskStatus.REVIEW]: "border-l-blue-500",
  [TaskStatus.DONE]: "border-l-green-500",
};

const statusLabel: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: "To Do",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.REVIEW]: "Review",
  [TaskStatus.DONE]: "Done",
};

export const EventCard = ({
  id,
  title,
  assignee,
  project,
  status,
}: EventCardProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    router.push(`/dashboard/workspaces/${workspaceId}/tasks/${id}`);
  };

  return (
    <div className="px-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={onClick}
            className={cn(
              "text-primary flex cursor-pointer flex-col gap-y-1.5 rounded-md border border-l-4 bg-white p-1.5 text-xs transition hover:opacity-75",
              statusColor[status],
            )}
          >
            <p>{title}</p>
            <div className="flex items-center gap-x-1">
              <p>{assignee?.user.name}</p>
              <div className="size-1 rounded-full bg-neutral-300" />
              <ProjectAvatar name={project.name} />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>{statusLabel[status]}</TooltipContent>
      </Tooltip>
    </div>
  );
};
