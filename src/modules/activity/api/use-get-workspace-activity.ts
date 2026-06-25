import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetWorkspaceActivityProps {
  workspaceId: string;
  page?: number;
  limit?: number;
}

export const useGetWorkspaceActivity = ({
  workspaceId,
  page = 1,
  limit = 10,
}: UseGetWorkspaceActivityProps) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.activity.getWorkspaceFeed.queryOptions({
      workspaceId,
      page,
      limit,
    }),
  );
};
