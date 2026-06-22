"use client";

import { DottedSeparator } from "@/components/DottedSeparator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, PlusIcon } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceId } from "@/modules/workspaces/hooks/use-workspace-id";
import { useQueryState } from "nuqs";
import { DataFilters } from "./data-table/DataFilters";
import { useTasksFilters } from "../hooks/use-tasks-filters";
import { DataTable } from "./data-table/data-table";
import { getColumns } from "./data-table/columns";
import { DataKanban } from "./data-table/Datakanban";
import { useCallback } from "react";
import { TaskStatus } from "../types";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import { DataCalendar } from "./data-table/DataCalendar";
import { useAuth } from "@clerk/nextjs";
import { useGetMembers } from "@/modules/members/api/use-get-members";
import useGetRole from "@/modules/workspaces/api/use-get-role";

interface TasksViewSwitcherProps {
  hideProjectFilter?: boolean;
  projectId?: string;
  myTasksByDefault?: boolean;
  isClient?: boolean;
}

export const TasksViewSwitcher = ({
  hideProjectFilter,
  projectId: projectIdProp,
  myTasksByDefault,
  isClient,
}: TasksViewSwitcherProps) => {
  const [{ status, assigneeId, projectId: filterProjectId, dueDate, showAll }] =
    useTasksFilters();
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });
  const { userId } = useAuth();
  const workspaceId = useWorkspaceId();
  const roleQuery = useGetRole({ workspaceId: workspaceId });
  const isClientRole = roleQuery.data?.isClient ?? false;
  const projectId = projectIdProp ?? filterProjectId;

  const { data: members } = useGetMembers(workspaceId);
  const currentMember = members?.find((m) => m.userId === userId);

  // When myTasksByDefault: show current user's tasks unless showAll is checked
  const effectiveAssigneeId =
    myTasksByDefault && !showAll ? currentMember?.id : assigneeId;

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    status,
    assigneeId: effectiveAssigneeId,
    projectId: projectId ?? filterProjectId,
    dueDate,
  });

  const bulkUpdate = useBulkUpdateTasks({
    workspaceId,
    projectId: projectId ?? "",
  });

  const { open } = useCreateTaskModal();

  const onKanbanChange = useCallback(
    (tasks: { id: string; status: TaskStatus; position: number }[]) => {
      if (isClient) return;
      bulkUpdate.mutate(
        tasks.map((task) => ({
          id: task.id,
          status: task.status,
          position: task.position,
        })),
      );
    },
    [bulkUpdate, isClient],
  );

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="w-full flex-1 rounded-lg border"
    >
      <div className="flex h-full flex-col overflow-auto p-4">
        <div className="flex flex-col items-center justify-between gap-y-2 lg:flex-row">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger className="h-8 w-full lg:w-auto cursor-pointer" value="table">
              Table
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto cursor-pointer" value="kanban">
              Kanban
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto cursor-pointer" value="calendar">
              Calendar
            </TabsTrigger>
          </TabsList>
          {!isClient && (
            <Button
              size="sm"
              className="flex w-full items-center justify-center text-center lg:w-auto cursor-pointer"
              onClick={() => open()}
              disabled={isClientRole}
            >
              <PlusIcon className="size-4" />
              New
            </Button>
          )}
        </div>
        <DottedSeparator className="my-4" />
        <DataFilters
          hideProjectFilter={hideProjectFilter}
          myTasksByDefault={myTasksByDefault}
        />
        <DottedSeparator className="my-4" />
        {isLoadingTasks ? (
          <div className="flex h-50 w-full flex-col items-center justify-center rounded-lg border">
            <Loader className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <DataTable columns={getColumns(isClient)} data={tasks ?? []} />
            </TabsContent>
            <TabsContent value="kanban" className="mt-0">
              <DataKanban
                data={tasks ?? []}
                onChange={onKanbanChange}
                disabled={isClient}
                isClient={isClient}
              />
            </TabsContent>
            <TabsContent value="calendar" className="mt-0 h-full pb-4">
              <DataCalendar data={tasks ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};
