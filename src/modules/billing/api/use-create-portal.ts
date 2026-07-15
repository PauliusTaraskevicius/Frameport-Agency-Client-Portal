import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useCreatePortal = () => {
  const trpc = useTRPC();

  const portal = useMutation(
    trpc.billing.createPortal.mutationOptions({
      onSuccess: (data) => {
        if (data.url) {
          window.location.href = data.url;
        }
      },
      onError: (error) =>
        toast.error(error.message || "Failed to create portal session"),
    }),
  );

  return portal;
};
