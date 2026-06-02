import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useUpdateComment = (fileId: string, projectId: string) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const updateComment = useMutation(
    trpc.files.updateComment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.files.getCommentsByFile.queryOptions({ projectId, fileId }),
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
