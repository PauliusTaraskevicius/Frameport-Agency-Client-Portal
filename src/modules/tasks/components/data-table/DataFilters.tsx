import { FolderIcon, ListChecksIcon, UserIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetProjects } from "@/modules/projects/api/use-get-projects";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/modules/members/api/use-get-members";
import { TaskStatus } from "../../types";
import { useTasksFilters } from "../../hooks/use-tasks-filters";
import { DatePicker } from "@/components/DatePicker";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@clerk/nextjs";

interface DataFiltersProps {
  hideProjectFilter?: boolean;
  myTasksByDefault?: boolean;
}

export const DataFilters = ({
  hideProjectFilter,
  myTasksByDefault,
}: DataFiltersProps) => {
  const workspaceId = useWorkspaceId();
  const { userId } = useAuth();

  const { data: projects, isLoading: isLoadingProjects } =
    useGetProjects(workspaceId);
  const { data: members, isLoading: isLoadingMembers } =
    useGetMembers(workspaceId);

  const currentMember = members?.find((m) => m.userId === userId);

  const isLoading = isLoadingProjects || isLoadingMembers;

  const projectOptions = projects?.map((project) => ({
    value: project.id,
    label: project.name,
  }));
  const memberOptions = members?.map((member) => ({
    value: member.id,
    label: member.user.firstName,
  }));

  const [{ status, assigneeId, projectId, dueDate, showAll }, setFilters] =
    useTasksFilters();

  const isMyTasksOnly =
    !myTasksByDefault && !!assigneeId && assigneeId === currentMember?.id;

  const onMyTasksChange = (checked: boolean) => {
    if (checked && currentMember) {
      setFilters({ assigneeId: currentMember.id });
    } else {
      setFilters({ assigneeId: null });
    }
  };

  const onShowAllChange = (checked: boolean) => {
    setFilters({ showAll: checked ? true : null });
  };

  const onStatusChange = (value: string) => {
    setFilters({ status: value === "all" ? null : (value as TaskStatus) });
  };
  const onAssigneeChange = (value: string) => {
    setFilters({ assigneeId: value === "all" ? null : (value as string) });
  };
  const onProjectChange = (value: string) => {
    setFilters({ projectId: value === "all" ? null : (value as string) });
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 lg:flex-row">
      <Select
        defaultValue={status ?? undefined}
        onValueChange={(value) => onStatusChange(value)}
      >
        <SelectTrigger className="h-8 w-full lg:w-auto">
          <div className="flex items-center pr-2">
            <ListChecksIcon className="mr-2 size-4" />
            <SelectValue placeholder="All statuses" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectSeparator />
          <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
          <SelectItem value={TaskStatus.REVIEW}>Review</SelectItem>
          <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
        </SelectContent>
      </Select>
      {!isMyTasksOnly && !myTasksByDefault && (
        <Select
          defaultValue={assigneeId ?? undefined}
          onValueChange={(value) => onAssigneeChange(value)}
        >
          <SelectTrigger className="h-8 w-full lg:w-auto">
            <div className="flex items-center pr-2">
              <UserIcon className="mr-2 size-4" />
              <SelectValue placeholder="All assignees" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            <SelectSeparator />
            {memberOptions?.map((member) => (
              <SelectItem key={member.value} value={member.value}>
                {member.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!hideProjectFilter && (
        <Select
          defaultValue={projectId ?? undefined}
          onValueChange={(value) => onProjectChange(value)}
        >
          <SelectTrigger className="h-8 w-full lg:w-auto">
            <div className="flex items-center pr-2">
              <FolderIcon className="mr-2 size-4" />
              <SelectValue placeholder="All projects" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            <SelectSeparator />
            {projectOptions?.map((project) => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <DatePicker
        placeholder="Due date"
        className="h-9 w-full lg:w-auto"
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) => {
          setFilters({ dueDate: date ? date.toISOString() : null });
        }}
      />
      {myTasksByDefault ? (
        <div className="flex items-center gap-2">
          <Checkbox checked={!!showAll} onCheckedChange={onShowAllChange} />
          <span className="text-muted-foreground text-sm">
            {showAll ? "Show my tasks only" : "Show all tasks"}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Checkbox checked={isMyTasksOnly} onCheckedChange={onMyTasksChange} />
          <span className="text-muted-foreground text-sm">
            {isMyTasksOnly ? "Show all tasks" : "Show my tasks only"}
          </span>
        </div>
      )}
    </div>
  );
};
