import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useUpdateMember = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const updateMember = useMutation(
    trpc.members.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.members.getMany.queryOptions({ workspaceId }),
        );
        toast.success("Member role updated successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update member role");
      },
    }),
  );

  return updateMember;
};
