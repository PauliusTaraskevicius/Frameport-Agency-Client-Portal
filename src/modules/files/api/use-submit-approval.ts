import { useTRPC } from "@/trpc/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useSubmitApproval = (fileId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const submitApproval = useMutation(
    trpc.files.submitForApproval.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.files.getOne.queryOptions({ fileId }),
        );

        queryClient.invalidateQueries(
          trpc.activity.getFileFeed.queryOptions({ fileId }),
        );

        const fileData = queryClient.getQueryData(
          trpc.files.getOne.queryOptions({ fileId }).queryKey,
        );
        const projectId = fileData?.project?.id;
        const workspaceId = fileData?.project?.workspaceId;

        if (projectId) {
          queryClient.invalidateQueries(
            trpc.activity.getProjectFeed.queryOptions({ projectId }),
          );
        }

        if (workspaceId) {
          queryClient.invalidateQueries(
            trpc.activity.getWorkspaceFeed.queryOptions({ workspaceId }),
          );
        }
      },
    }),
  );

  return submitApproval;
};
