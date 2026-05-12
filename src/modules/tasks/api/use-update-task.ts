import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseUpdateTaskOptions {
  workspaceId: string;
  projectId: string;
  onSuccess?: () => void;
}

export const useUpdateTask = ({
  workspaceId,
  projectId,
  onSuccess,
}: UseUpdateTaskOptions) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const updatedTask = useMutation(
    trpc.tasks.update.mutationOptions({
      onMutate: async (variables) => {
        // Cancel in-flight queries for this task
        await queryClient.cancelQueries({
          queryKey: trpc.tasks.getOne.queryKey({ taskId: variables.taskId }),
        });

        // Snapshot previous value
        const previous = queryClient.getQueryData(
          trpc.tasks.getOne.queryKey({ taskId: variables.taskId }),
        );

        // Optimistically update the cache
        queryClient.setQueryData(
          trpc.tasks.getOne.queryKey({ taskId: variables.taskId }),
          (old: any) => (old ? { ...old, ...variables } : old),
        );

        queryClient.invalidateQueries({
          queryKey: trpc.workspaces.getWorkspaceAnalytics.queryKey({
            workspaceId,
          }),
        });

        return { previous, taskId: variables.taskId };
      },
      onSuccess: (data) => {
        // Sync server response into getOne cache
        queryClient.setQueryData(
          trpc.tasks.getOne.queryKey({ taskId: data.id }),
          (old: any) => (old ? { ...old, ...data } : old),
        );
        // Invalidate getMany in background (no await, no projectId so it matches all variants)
        queryClient.invalidateQueries({
          queryKey: trpc.tasks.getMany.queryKey({ workspaceId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.tasks.getOne.queryKey({ taskId: data.id }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getOne.queryKey({ projectId }),
        });
        queryClient.invalidateQueries(
          trpc.projects.getProjectAnalytics.queryOptions({ projectId }),
        );

        toast.success("Task updated successfully");
        onSuccess?.();
      },
      onError: (error, variables, context: any) => {
        // Roll back optimistic update on error
        if (context?.previous !== undefined) {
          queryClient.setQueryData(
            trpc.tasks.getOne.queryKey({ taskId: context.taskId }),
            context.previous,
          );
        }
        toast.error(
          error.message || "An error occurred while updating the task",
        );
      },
    }),
  );

  return updatedTask;
};
