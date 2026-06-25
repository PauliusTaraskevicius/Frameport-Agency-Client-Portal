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
      onSuccess: (_data, variables) => {
        toast.success("Task deleted successfully");
        queryClient.invalidateQueries(
          trpc.tasks.getMany.queryFilter({ workspaceId }),
        );
        queryClient.invalidateQueries({
          queryKey: trpc.workspaces.getWorkspaceAnalytics.queryKey({
            workspaceId,
          }),
        });
        queryClient.invalidateQueries(
          trpc.projects.getProjectAnalytics.queryOptions({ projectId }),
        );

        queryClient.invalidateQueries(
          trpc.activity.getWorkspaceFeed.queryOptions({
            workspaceId
          }),
        );

        queryClient.invalidateQueries(
          trpc.activity.getProjectFeed.queryOptions({
            projectId
          }),
        );

        queryClient.invalidateQueries(
          trpc.activity.getTaskFeed.queryOptions({
            taskId: variables.taskId,
          }),
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
