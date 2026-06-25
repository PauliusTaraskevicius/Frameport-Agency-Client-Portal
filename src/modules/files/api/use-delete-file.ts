import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export const useDeleteFile = ({ projectId }: { projectId: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const deleteFile = useMutation(
    trpc.files.delete.mutationOptions({
      onSuccess: (_data, variables) => {
        toast.success("File deleted successfully");

        queryClient.invalidateQueries(
          trpc.files.getMany.queryOptions({ projectId }),
        );

        queryClient.invalidateQueries(
          trpc.files.getOne.queryOptions({ fileId: variables.fileId }),
        );

        queryClient.invalidateQueries(
          trpc.activity.getProjectFeed.queryOptions({ projectId }),
        );

        queryClient.invalidateQueries(
          trpc.activity.getFileFeed.queryOptions({
            fileId: variables.fileId,
          }),
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

        router.refresh();
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while deleting the file",
        );
      },
    }),
  );

  return deleteFile;
};
