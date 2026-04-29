import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface UseGetProjectProps {
  projectId: string;
}

export default function useGetProject({ projectId }: UseGetProjectProps) {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.projects.getOne.queryOptions({
      projectId,
    }),
  );

  if (query.isError) {
    throw new Error("Failed to fetch project");
  }

  return query;
}
