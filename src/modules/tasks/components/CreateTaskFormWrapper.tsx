import { Card, CardContent } from "@/components/ui/card";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { CreateTaskForm } from "./CreateTaskForm";

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
}

export const CreateTaskFormWrapper = ({
  onCancel,
}: CreateTaskFormWrapperProps) => {
  const trpc = useTRPC();
  const workspaceId = useWorkspaceId();

  const { data: projects, isLoading: isLoadingProjects } = useQuery(
    trpc.projects.getMany.queryOptions({
      workspaceId,
    }),
  );
  const { data: members, isLoading: isLoadingMembers } = useQuery(
    trpc.members.getMany.queryOptions({
      workspaceId,
    }),
  );

  const projectOptions = projects?.map((project) => ({
    name: project.name,
    id: project.id,
  }));
  const memberOptions = members?.map((member) => ({
    name: member.user.firstName ?? "Unknown",
    id: member.id,
  }));

  const isLoading = isLoadingProjects || isLoadingMembers;

  if (isLoading) {
    return (
      <Card className="h-178.5 w-full border-none shadow-none">
        <CardContent className="flex h-full items-center justify-center">
          <Loader className="text-muted-foreground size-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <CreateTaskForm
        onCancel={onCancel}
        projectOptions={projectOptions ?? []}
        memberOptions={memberOptions ?? []}
        
      />
    </div>
  );
};
