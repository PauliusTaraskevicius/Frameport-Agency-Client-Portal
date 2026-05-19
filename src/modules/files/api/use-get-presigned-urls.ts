import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export const useGetPresignedUrls = () => {
  const trpc = useTRPC();
  return useMutation(trpc.files.getPresignedUrls.mutationOptions());
};
