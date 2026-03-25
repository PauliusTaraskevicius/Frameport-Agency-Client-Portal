import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export const useDeleteWorkspace = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const deleteWorkspace = useMutation(
    trpc.workspaces.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Workspace deleted successfully");
        queryClient.invalidateQueries(trpc.workspaces.getMany.queryOptions());
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while deleting the workspace",
        );
      },
    }),
  );

  return deleteWorkspace;
};
