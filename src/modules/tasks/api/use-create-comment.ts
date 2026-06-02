import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useCreateComment = (taskId: string, projectId: string) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const createComment = useMutation(
    trpc.tasks.createComment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.tasks.getCommentsByTask.queryOptions({ projectId, taskId }),
        );
        toast.success("Comment created successfully");
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while creating the comment",
        );
      },
    }),
  );

  return createComment;
};
