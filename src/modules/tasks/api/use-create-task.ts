import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export const useCreateTask = (workspaceId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const createTask = useMutation(
    trpc.tasks.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.tasks.getMany.queryFilter({ workspaceId }),
        );
        queryClient.invalidateQueries(
          trpc.projects.getProjectAnalytics.queryOptions({
            projectId: data.projectId,
          }),
        );
        queryClient.invalidateQueries({
          queryKey: trpc.workspaces.getWorkspaceAnalytics.queryKey({
            workspaceId,
          }),
        });

        toast.success("Task created successfully");
        router.push(
          `/dashboard/workspaces/${workspaceId}/projects/${data.projectId}`,
        );
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while creating the task",
        );
      },
    }),
  );

  return createTask;
};
