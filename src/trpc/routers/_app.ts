import { workspaceRouter } from "@/modules/workspaces/server/procedures";
import { createTRPCRouter } from "../init";
import { invitationRouter } from "@/modules/invitations/server/procedures";
import { membersRouter } from "@/modules/members/server/procedures";
import { projectsRouter } from "@/modules/projects/server/procedures";
import { clientsRouter } from "@/modules/clients/server/procedures";
import { tasksRouter } from "@/modules/tasks/server/procedures";
import { filesRouter } from "@/modules/files/server/procedures";
import { activityRouter } from "@/modules/activity/server/procedures";

export const appRouter = createTRPCRouter({
  workspaces: workspaceRouter,
  invitations: invitationRouter,
  members: membersRouter,
  projects: projectsRouter,
  clients: clientsRouter,
  tasks: tasksRouter,
  files: filesRouter,
  activity: activityRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
