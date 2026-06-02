import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useDeleteComment = (taskId: string, projectId: string) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const deleteComment = useMutation(
    trpc.tasks.deleteComment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.tasks.getCommentsByTask.queryOptions({ projectId, taskId }),
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
