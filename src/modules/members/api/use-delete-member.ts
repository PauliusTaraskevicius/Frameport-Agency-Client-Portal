import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useDeleteMember = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const deleteMember = useMutation(
    trpc.members.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.members.getMany.queryOptions({ workspaceId }),
        );
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete member");
      },
    }),
  );

  return deleteMember;
};
