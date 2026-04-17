import { Card, CardContent } from "@/components/ui/card";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { CreateTaskForm } from "./CreateTaskForm";
import { useGetTask } from "../api/use-get-task";
import { UpdateTaskForm } from "./UpdateTaskForm";

interface UpdateTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const UpdateTaskFormWrapper = ({
  onCancel,
  id,
}: UpdateTaskFormWrapperProps) => {
  const trpc = useTRPC();
  const workspaceId = useWorkspaceId();

  const { data: task, isLoading: isLoadingTask } = useGetTask({ taskId: id });

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

  const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTask;

  if (isLoading) {
    return (
      <Card className="h-178.5 w-full border-none shadow-none">
        <CardContent className="flex h-full items-center justify-center">
          <Loader className="text-muted-foreground size-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div>
      <UpdateTaskForm
        onCancel={onCancel}
        projectOptions={projectOptions ?? []}
        memberOptions={memberOptions ?? []}
        initialValues={task}
      />
    </div>
  );
};
