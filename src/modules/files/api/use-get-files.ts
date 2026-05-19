import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetFiles {
  projectId: string;
}

export const useGetFiles = ({ projectId }: UseGetFiles) => {
  const trpc = useTRPC();
  const query = useQuery(trpc.files.getMany.queryOptions({ projectId }));

  if (query.isError) {
    throw new Error("Failed to fetch files");
  }

  return query;
};
