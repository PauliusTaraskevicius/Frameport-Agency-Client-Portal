import { useTRPC } from "@/trpc/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useSubmitApproval = (fileId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const submitApproval = useMutation(
    trpc.files.submitForApproval.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries(
          trpc.files.getOne.queryOptions({ fileId }),
        ),
    }),
  );

  return submitApproval;
};
