import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useGetProjects = (workspaceId: string) => {
  const trpc = useTRPC();

  const query = useQuery(trpc.projects.getMany.queryOptions({ workspaceId }));

  if (query.isError) {
    throw new Error("Failed to fetch project");
  }

  return query;
};
