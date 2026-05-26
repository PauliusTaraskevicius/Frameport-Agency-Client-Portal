import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export const useDeleteFile = ({ projectId }: { projectId: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const deleteFile = useMutation(
    trpc.files.delete.mutationOptions({
      onSuccess: () => {
        toast.success("File deleted successfully");
        queryClient.invalidateQueries(
          trpc.files.getMany.queryOptions({ projectId }),
        );
        router.refresh();
      },
      onError: (error) => {
        toast.error(
          error.message || "An error occurred while deleting the file",
        );
      },
    }),
  );

  return deleteFile;
};
