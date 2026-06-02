import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useGetTaskComments = ({
  taskId,
  projectId,
}: {
  taskId: string;
  projectId: string;
}) => {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.tasks.getCommentsByTask.queryOptions({ taskId, projectId }),
  );

  return query;
};
