import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetProjectAnalyticsProps {
  projectId: string;
}

export default function useGetProjectAnalytics({
  projectId,
}: UseGetProjectAnalyticsProps) {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.projects.getProjectAnalytics.queryOptions({
      projectId,
    }),
  );

  if (query.isError) {
    throw new Error("Failed to fetch project analytics");
  }

  return query;
}
