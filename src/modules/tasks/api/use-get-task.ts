import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetTaskProps {
  taskId: string;
}

export const useGetTask = ({ taskId }: UseGetTaskProps) => {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.tasks.getOne.queryOptions({
      taskId,
    }),
  );

  return query;
};
