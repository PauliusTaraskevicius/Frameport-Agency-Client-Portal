import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useDeleteComment = (fileId: string, projectId: string) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const deleteComment = useMutation(
    trpc.files.deleteComment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.files.getCommentsByFile.queryOptions({ projectId, fileId }),
        );
        toast.success("Comment deleted successfully");
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while deleting the comment",
        );
      },
    }),
  );
  return deleteComment;
};
