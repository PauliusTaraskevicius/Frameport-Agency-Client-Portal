import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useResetInvitation = (initialValues: { id: string }) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const resetInvitation = useMutation(
    trpc.invitations.reset.mutationOptions({
      onSuccess: () => {
        toast.success("Invitation reset and resent successfully");
        queryClient.invalidateQueries(
          trpc.invitations.getByWorkspace.queryOptions({
            workspaceId: initialValues.id,
          }),
        );
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while resetting the invitation",
        );
      },
    }),
  );

  return resetInvitation;
};
