import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useGetPlans = () => {
  const trpc = useTRPC();
  const query = useQuery(trpc.billing.getPlans.queryOptions());

  if (query.isError) {
    throw new Error("Failed to fetch plans");
  }

  return query;
};
