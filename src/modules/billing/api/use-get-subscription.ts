import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useGetSubscription = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.billing.getSubscription.queryOptions({ workspaceId }),
  );

  if (query.isError) {
    throw new Error("Failed to fetch subscription");
  }

  return query;
};
