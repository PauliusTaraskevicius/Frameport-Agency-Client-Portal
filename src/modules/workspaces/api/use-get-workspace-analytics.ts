import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetWorkspaceAnalyticsProps {
  workspaceId: string;
}

export default function useGetWorkspaceAnalytics({
  workspaceId,
}: UseGetWorkspaceAnalyticsProps) {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.workspaces.getWorkspaceAnalytics.queryOptions({
      workspaceId,
    }),
  );

  if (query.isError) {
    throw new Error("Failed to fetch workspace analytics");
  }

  return query;
}
 