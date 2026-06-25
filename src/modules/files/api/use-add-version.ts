import { useTRPC } from "@/trpc/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useAddVersion = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const addVersion = useMutation(
    trpc.files.addVersion.mutationOptions({
      onSuccess: (data, variables) => {
        const [, file] = data;
        const projectId = file.projectId;

        queryClient.invalidateQueries(
          trpc.files.getVersions.queryOptions({ fileId: variables.fileId }),
        );

        queryClient.invalidateQueries(
          trpc.files.getOne.queryOptions({ fileId: variables.fileId }),
        );

        queryClient.invalidateQueries(
          trpc.files.getMany.queryOptions({ projectId }),
        );

        queryClient.invalidateQueries(
          trpc.activity.getProjectFeed.queryOptions({ projectId }),
        );

        queryClient.invalidateQueries(
          trpc.activity.getFileFeed.queryOptions({
            fileId: variables.fileId,
          }),
        );
      },
    }),
  );

  return addVersion;
};
