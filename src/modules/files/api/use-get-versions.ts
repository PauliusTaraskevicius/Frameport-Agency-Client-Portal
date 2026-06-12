import { useTRPC } from "@/trpc/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";

export const useGetVersions = ({ fileId }: { fileId: string }) => {
  const trpc = useTRPC();

  const query = useQuery(trpc.files.getVersions.queryOptions({ fileId }));

  return query;
};
