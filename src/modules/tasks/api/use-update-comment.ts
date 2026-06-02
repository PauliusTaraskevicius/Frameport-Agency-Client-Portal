import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useUpdateComment = (taskId: string, projectId: string) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const updateComment = useMutation(
    trpc.tasks.updateComment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.tasks.getCommentsByTask.queryOptions({ projectId, taskId }),
        );
        toast.success("Comment updated successfully");
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while updating the comment",
        );
      },
    }),
  );

  return updateComment;
};
