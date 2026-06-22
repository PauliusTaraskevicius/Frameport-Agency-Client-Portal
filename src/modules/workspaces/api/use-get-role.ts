import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetRoleProps {
  workspaceId: string;
}

export default function useGetRole({ workspaceId }: UseGetRoleProps) {
  const trpc = useTRPC();
  const query = useQuery(trpc.workspaces.getRole.queryOptions({ workspaceId }));

  return query;
}
