import { useTRPC } from "@/trpc/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useRequestApproval = (fileId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.files.requestApproval.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries(
          trpc.files.getVersions.queryOptions({ fileId }),
        ),
    }),
  );
};
