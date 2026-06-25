import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useGetFileVersions = (fileId: string) => {
  const trpc = useTRPC();

  const query = useQuery(trpc.files.getVersions.queryOptions({ fileId }));

  if (query.isError) {
    throw new Error("Failed to fetch file versions");
  }

  return query;
};
 