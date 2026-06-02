import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useCreateComment = (fileId: string, projectId: string) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const createComment = useMutation(
    trpc.files.createComment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.files.getCommentsByFile.queryOptions({ projectId, fileId }),
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
