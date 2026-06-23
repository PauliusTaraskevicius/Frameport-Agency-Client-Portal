import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetFileActivityProps {
  fileId: string;
  page?: number;
  limit?: number;
}

export const useGetFileActivity = ({
  fileId,
  page = 1,
  limit = 10,
}: UseGetFileActivityProps) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.activity.getFileFeed.queryOptions({
      fileId,
      page,
      limit,
    }),
  );
};
