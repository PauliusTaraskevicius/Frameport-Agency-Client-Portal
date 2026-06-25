import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetProjectActivityProps {
  projectId: string;
  page?: number;
  limit?: number;
}

export const useGetProjectActivity = ({
  projectId,
  page = 1,
  limit = 10,
}: UseGetProjectActivityProps) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.activity.getProjectFeed.queryOptions({
      projectId,
      page,
      limit,
    }),
  );
};
