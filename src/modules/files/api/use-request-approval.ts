import { useTRPC } from "@/trpc/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useRequestApproval = (fileId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const requestApproval = useMutation(
    trpc.files.requestApproval.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries(
          trpc.files.getOne.queryOptions({ fileId }),
        ),
    }),
  );

  return requestApproval;
};
