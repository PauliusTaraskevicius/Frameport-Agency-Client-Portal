import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

export function useDownloadVersion() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return async (fileVersionId: string) => {
    const data = await queryClient.fetchQuery(
      trpc.files.getVersionDownloadUrl.queryOptions({ fileVersionId }),
    );
    const link = document.createElement("a");
    link.href = data.url;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
}
