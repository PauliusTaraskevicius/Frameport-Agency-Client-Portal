import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetRoleProps {
  workspaceId: string;
  enabled?: boolean;
}

export default function useGetRole({
  workspaceId,
  enabled = true,
}: UseGetRoleProps) {
  const trpc = useTRPC();
  const query = useQuery({
    ...trpc.workspaces.getRole.queryOptions({ workspaceId }),
    enabled,
  });

  return query;
}
