import { useTRPC } from "@/trpc/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useAddVersion = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const addVersion = useMutation(
    trpc.files.addVersion.mutationOptions({
      onSuccess: (_, variables) =>
        queryClient.invalidateQueries(
          trpc.files.getVersions.queryOptions({ fileId: variables.fileId }),
        ),
    }),
  );

  return addVersion;
};
