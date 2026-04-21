import { formatStatus } from "@/lib/utils";
import { TaskStatus } from "../../types";

import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleIcon,
  CircleDotIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTaskModal } from "../../hooks/use-create-task-modal";

interface KanbanColumnHeaderProps {
  board: TaskStatus;
  taskCount: number;
}

const statusIconMap: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.TODO]: <CircleIcon className="size-4.5 text-red-400" />,
  [TaskStatus.IN_PROGRESS]: <CircleIcon className="size-4.5 text-yellow-400" />,
  [TaskStatus.REVIEW]: <CircleIcon className="size-4.5 text-blue-400" />,
  [TaskStatus.DONE]: <CircleIcon className="size-4.5 text-emerald-400" />,
};

export const KanbanColumnHeader = ({
  board,
  taskCount,
}: KanbanColumnHeaderProps) => {
  const { open } = useCreateTaskModal();

  const icon = statusIconMap[board];

  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <div className="flex items-center gap-x-2">
        {icon}
        <h2 className="text-sm font-medium">{formatStatus(board)}</h2>
        <div className="flex size-5 items-center justify-center rounded-md bg-neutral-200 text-xs font-medium text-neutral-700">
          {taskCount}
        </div>
      </div>
      <Button onClick={() => open(board)} variant="ghost" size="icon" className="size-5">
        <PlusIcon className="size-4 text-neutral-500" />
      </Button>
    </div>
  );
};
