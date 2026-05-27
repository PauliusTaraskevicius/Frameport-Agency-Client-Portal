import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetFile {
  fileId: string;
}

export const useGetFile = ({ fileId }: UseGetFile) => {
  const trpc = useTRPC();
  const query = useQuery(trpc.files.getOne.queryOptions({ fileId }));

  return query;
};
