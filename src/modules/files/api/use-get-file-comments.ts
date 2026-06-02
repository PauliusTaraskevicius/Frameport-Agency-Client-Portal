import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useGetFileComments = ({
  fileId,
  projectId,
}: {
  fileId: string;
  projectId: string;
}) => {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.files.getCommentsByFile.queryOptions({ fileId, projectId }),
  );

  return query;
};
