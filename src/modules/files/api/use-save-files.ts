import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export const useSaveFiles = () => {
  const trpc = useTRPC();
  return useMutation(trpc.files.saveFiles.mutationOptions());
};
