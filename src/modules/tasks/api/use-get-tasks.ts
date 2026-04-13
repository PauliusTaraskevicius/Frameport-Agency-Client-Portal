import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { TaskStatus } from "../types";

interface UseGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  search?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  assigneeId,
  dueDate,
  search,
}: UseGetTasksProps) => {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.tasks.getMany.queryOptions({
      workspaceId,
      projectId: projectId ?? undefined,
      status: status ?? undefined,
      assigneeId: assigneeId ?? undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      search: search ?? undefined,
    }),
  );

  return query;
};
