import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSaveFiles = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.files.saveFiles.mutationOptions({
      onSuccess: (_data, variables) => {
        const { projectId } = variables;

        queryClient.invalidateQueries(
          trpc.files.getMany.queryOptions({ projectId }),
        );

        queryClient.invalidateQueries(
          trpc.activity.getProjectFeed.queryOptions({ projectId }),
        );

        const filesData = queryClient.getQueryData(
          trpc.files.getMany.queryOptions({ projectId }).queryKey,
        );
        const workspaceId = filesData?.[0]?.project?.workspaceId;
        if (workspaceId) {
          queryClient.invalidateQueries(
            trpc.activity.getWorkspaceFeed.queryOptions({ workspaceId }),
          );
        }
      },
    }),
  );
};
