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
        queryClient.invalidateQueries(
          trpc.projects.getMany.queryOptions({ workspaceId: data.workspaceId }),
        );
        queryClient.invalidateQueries(
          trpc.projects.getOne.queryOptions({ projectId: data.id }),
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
