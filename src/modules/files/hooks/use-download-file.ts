import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

export function useDownloadFile() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return async (fileId: string) => {
    const data = await queryClient.fetchQuery(
      trpc.files.getDownloadUrl.queryOptions({
        fileId,
      }),
    );

    // Trigger browser download without navigating away
    const link = document.createElement("a");
    link.href = data.url;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
}
