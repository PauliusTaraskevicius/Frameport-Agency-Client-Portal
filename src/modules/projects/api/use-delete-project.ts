import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export const useDeleteProject = ({ workspaceId }: { workspaceId: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const deleteProject = useMutation(
    trpc.projects.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Project deleted successfully");
        queryClient.invalidateQueries(
          trpc.projects.getMany.queryOptions({ workspaceId }),
        );
        router.push(`/dashboard/workspaces/${workspaceId}`);
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while deleting the project",
        );
      },
    }),
  );

  return deleteProject;
};
