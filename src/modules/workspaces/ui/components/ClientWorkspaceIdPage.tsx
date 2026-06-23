"use client";

import { useState } from "react";
import { useGetTasks } from "@/modules/tasks/api/use-get-tasks";
import useGetWorkspaceAnalytics from "../../api/use-get-workspace-analytics";
import { useWorkspaceId } from "../../hooks/use-workspace-id";
import { useGetProjects } from "@/modules/projects/api/use-get-projects";
import { useGetMembers } from "@/modules/members/api/use-get-members";
import { useCreateProjectModal } from "@/modules/projects/hooks/use-create-project-modal";
import { useCreateTaskModal } from "@/modules/tasks/hooks/use-create-task-modal";
import { PageLoader } from "@/components/PageLoader";
import { PageError } from "@/components/PageError";
import { Analytics } from "@/components/Analytics";
import { Task } from "@/modules/tasks/types";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { DottedSeparator } from "@/components/DottedSeparator";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Project } from "@/generated/prisma/browser";
import { ProjectAvatar } from "@/modules/projects/ui/components/ProjectAvatar";
import useGetRole from "../../api/use-get-role";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityFeed } from "@/modules/activity/ui/components/ActivityFeed";
import { useGetWorkspaceActivity } from "@/modules/activity/hooks/use-get-workspace-activity";

export const ClientWorkspaceIdPage = () => {
  const workspaceId = useWorkspaceId();
  const [activityPage, setActivityPage] = useState(1);

  const getWorkspaceAnalytics = useGetWorkspaceAnalytics({
    workspaceId,
  });

  const getProjects = useGetProjects(workspaceId);
  const getMembers = useGetMembers(workspaceId);
  const getTasks = useGetTasks({ workspaceId });
  const getActivity = useGetWorkspaceActivity({
    workspaceId,
    page: activityPage,
    limit: 10,
  });

  const roleQuery = useGetRole({ workspaceId: workspaceId });
  const isClient = roleQuery.data?.isClient ?? false;

  const isLoading =
    getWorkspaceAnalytics.isLoading ||
    getTasks.isLoading ||
    getProjects.isLoading ||
    getMembers.isLoading;

  if (isLoading) {
    return <PageLoader />;
  }

  if (
    !getWorkspaceAnalytics.data ||
    !getTasks.data ||
    !getProjects.data ||
    !getMembers.data
  ) {
    return <PageError message="Failed to load workspace data" />;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="h-8 w-full lg:w-auto cursor-pointer">
            Overview
          </TabsTrigger>
          {!isClient && (
            <TabsTrigger value="activity" className="h-8 w-full lg:w-auto cursor-pointer">
              Activity
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Analytics data={getWorkspaceAnalytics.data} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <TaskList tasks={getTasks.data} total={getTasks.data.length} />
            <ProjectList
              projects={getProjects.data}
              total={getProjects.data.length}
            />
            <MembersList
              members={getMembers.data}
              total={getMembers.data.length}
            />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="mb-4 text-lg font-semibold">Activity</p>
            <ActivityFeed
              logs={getActivity.data?.logs ?? []}
              totalPages={getActivity.data?.totalPages ?? 0}
              currentPage={getActivity.data?.currentPage ?? 1}
              onPageChange={setActivityPage}
              isLoading={getActivity.isLoading}
              error={getActivity.error}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface TaskListProps {
  tasks: Task[];
  total: number;
}

export const TaskList = ({ tasks, total }: TaskListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createTask } = useCreateTaskModal();
  const roleQuery = useGetRole({ workspaceId: workspaceId });
  const isClient = roleQuery.data?.isClient ?? false;

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Tasks ({total})</p>
          <Button
            variant="default"
            size="icon"
            onClick={() => createTask()}
            className="cursor-pointer"
            disabled={isClient}
          >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="flex flex-col gap-y-4">
          {tasks.slice(0, 5).map((task) => (
            <li key={task.id}>
              <Link
                href={`/dashboard/workspaces/${workspaceId}/tasks/${task.id}`}
              >
                <Card className="rounded-lg shadow-none transition hover:opacity-75">
                  <CardContent className="p-4">
                    <p className="truncate text-lg font-medium">{task.title}</p>
                    <div className="flex items-center gap-x-2">
                      <p>{task.project?.name}</p>
                      <div className="size-1 rounded-full bg-neutral-300" />
                      <div className="text-muted-foreground flex items-center text-sm">
                        <CalendarIcon className="mr-1 size-3" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(task.dueDate))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-muted-foreground hidden text-center text-sm first-of-type:block">
            No task found
          </li>
        </ul>
        <Button variant="default" className="mt-4 w-full cursor-pointer">
          <Link href={`/dashboard/workspaces/${workspaceId}/tasks`}>
            Show All
          </Link>
        </Button>
      </div>
    </div>
  );
};
interface ProjectListProps {
  projects: Project[];
  total: number;
}

export const ProjectList = ({ projects, total }: ProjectListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();
  const roleQuery = useGetRole({ workspaceId: workspaceId });
  const isClient = roleQuery.data?.isClient ?? false;

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Projects ({total})</p>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => createProject()}
            disabled={isClient}
            className="cursor-pointer"
          >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/dashboard/workspaces/${workspaceId}/projects/${project.id}`}
              >
                <Card className="rounded-lg shadow-none transition hover:opacity-75">
                  <CardContent className="flex items-center gap-x-2.5 p-4">
                    <ProjectAvatar
                      name={project.name}
                      className="size-12"
                      fallbackClassName="text-lg"
                    />
                    <p className="truncate text-lg font-medium">
                      {project.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-muted-foreground hidden text-center text-sm first-of-type:block">
            No projects found
          </li>
        </ul>
      </div>
    </div>
  );
};

type MemberWithUser = NonNullable<
  ReturnType<typeof useGetMembers>["data"]
>[number];

interface MembersListProps {
  members: MemberWithUser[];
  total: number;
}

export const MembersList = ({ members, total }: MembersListProps) => {
  const workspaceId = useWorkspaceId();

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Members ({total})</p>
          <Button
            asChild
            variant="secondary"
            size="icon"
            className="cursor-pointer"
          >
            <Link href={`/dashboard/workspaces/${workspaceId}/members`}>
              <SettingsIcon className="size-4 text-neutral-400" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <li key={member.id}>
              <Card className="rounded-lg shadow-none transition hover:opacity-75">
                <CardContent className="flex flex-col items-center gap-x-2 p-3">
                  <div className="flex flex-col items-center overflow-hidden">
                    <p className="line-clamp-1 text-lg font-medium">
                      {member.user.firstName}
                    </p>
                    <p className="text-muted-foreground line-clamp-1 text-sm">
                      {member.user.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
          <li className="text-muted-foreground hidden text-center text-sm first-of-type:block">
            No members found
          </li>
        </ul>
      </div>
    </div>
  );
};
