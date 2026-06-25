import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export const useUpdateWorkspace = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const updateWorkspace = useMutation(
    trpc.workspaces.update.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.workspaces.getMany.queryOptions());

        queryClient.invalidateQueries(
          trpc.activity.getWorkspaceFeed.queryOptions({
            workspaceId: data.id,
          }),
        );

        toast.success("Workspace updated successfully");
        router.push(`/dashboard/workspaces/${data.id}`);
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while updating the workspace",
        );
      },
    }),
  );

  return updateWorkspace;
};
