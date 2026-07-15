import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

export const useCreateCheckout = () => {
  const trpc = useTRPC();

  const checkout = useMutation(
    trpc.billing.createCheckoutSession.mutationOptions({
      onSuccess: (data) => {
        if (data.url) {
          window.location.href = data.url;
        }
      },
      onError: (error) =>
        toast.error(error.message || "Failed to create checkout session"),
    }),
  );

  return checkout;
};
