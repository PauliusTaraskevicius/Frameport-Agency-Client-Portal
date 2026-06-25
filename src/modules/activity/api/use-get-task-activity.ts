import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetTaskActivityProps {
  taskId: string;
  page?: number;
  limit?: number;
}

export const useGetTaskActivity = ({
  taskId,
  page = 1,
  limit = 10,
}: UseGetTaskActivityProps) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.activity.getTaskFeed.queryOptions({
      taskId,
      page,
      limit,
    }),
  );
};
