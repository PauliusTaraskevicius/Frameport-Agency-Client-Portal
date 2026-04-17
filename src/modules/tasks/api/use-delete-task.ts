import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

interface UseDeleteTaskOptions {
  workspaceId: string;
  projectId: string;
}

export const useDeleteTask = ({
  workspaceId,
  projectId,
}: UseDeleteTaskOptions) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const deleteTask = useMutation(
    trpc.tasks.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Task deleted successfully");
        queryClient.invalidateQueries(
          trpc.tasks.getMany.queryFilter({ workspaceId }),
        );
        router.push(
          `/dashboard/workspaces/${workspaceId}/projects/${projectId}`,
        );
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while deleting the task",
        );
      },
    }),
  );

  return deleteTask;
};
