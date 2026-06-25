import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export const useUpdateProject = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const updateProject = useMutation(
    trpc.projects.update.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getMany.queryKey({
            workspaceId: data.workspaceId,
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getOne.queryKey({ projectId: data.id }),
        });
        queryClient.invalidateQueries(
          trpc.activity.getWorkspaceFeed.queryOptions({
            workspaceId: data.workspaceId,
          }),
        );

        queryClient.invalidateQueries(
          trpc.activity.getProjectFeed.queryOptions({
            projectId: data.id,
          }),
        );
        toast.success("Project updated successfully");
        router.push(
          `/dashboard/workspaces/${data.workspaceId}/projects/${data.id}`,
        );
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while updating the project",
        );
      },
    }),
  );

  return updateProject;
};
