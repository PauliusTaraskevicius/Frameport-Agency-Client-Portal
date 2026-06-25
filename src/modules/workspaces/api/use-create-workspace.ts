import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export const useCreateWorkspace = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const createWorkspace = useMutation(
    trpc.workspaces.create.mutationOptions({
      onSuccess: (data, variables) => {
        toast.success("Workspace created successfully");
        queryClient.invalidateQueries(trpc.workspaces.getMany.queryOptions());

        queryClient.invalidateQueries(
          trpc.activity.getWorkspaceFeed.queryOptions({
            workspaceId: data.id,
          }),
        );

        router.push(`/dashboard/workspaces/${data.id}`);
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while creating the workspace",
        );
        if (error.data?.code === "TOO_MANY_REQUESTS") {
          //   router.push("/pricing");
          toast.error(
            "You are creating workspaces too quickly. Please wait a moment and try again.",
          );
        }
      },
    }),
  );

  return createWorkspace;
};
