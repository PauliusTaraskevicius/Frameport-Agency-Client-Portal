import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseUpdateTaskOptions {
  workspaceId: string;
  projectId: string;
}

export const useBulkUpdateTasks = ({ workspaceId }: UseUpdateTaskOptions) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const updateBulk = useMutation(
    trpc.tasks.bulk.mutationOptions({
      onSuccess: () => {
        // Invalidate getMany in background (no await, no projectId so it matches all variants)
        queryClient.invalidateQueries({
          queryKey: trpc.tasks.getMany.queryKey({ workspaceId }),
        });
        toast.success("Tasks updated successfully");
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while updating the tasks",
        );
      },
    }),
  );

  return updateBulk;
};
