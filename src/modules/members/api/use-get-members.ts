import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useGetMembers = (workspaceId: string) => {
  const trpc = useTRPC();

  const query = useQuery(trpc.members.getMany.queryOptions({ workspaceId }));

  return query;
};
