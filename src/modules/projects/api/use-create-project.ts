import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export const useCreateProject = (workspaceId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.projects.getMany.queryOptions({ workspaceId }),
        );
        router.push(`/dashboard/workspaces/${workspaceId}/projects/${data.id}`);
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while creating the project",
        );
      },
    }),
  );

  return createProject;
};
