import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useRevokeInvitation = (initialValues: { id: string }) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const revokeInvitation = useMutation(
    trpc.invitations.revoke.mutationOptions({
      onSuccess: () => {
        toast.success("Invitation cancelled successfully");
        queryClient.invalidateQueries(
          trpc.invitations.getByWorkspace.queryOptions({
            workspaceId: initialValues.id,
          }),
        );
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while cancelling the invitation",
        );
      },
    }),
  );

  return revokeInvitation;
};
