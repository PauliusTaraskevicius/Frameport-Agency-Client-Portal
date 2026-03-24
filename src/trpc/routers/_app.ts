import { workspaceRouter } from "@/modules/workspaces/server/procedures";
import { createTRPCRouter } from "../init";
import { invitationRouter } from "@/modules/invitations/server/procedures";
import { membersRouter } from "@/modules/members/server/procedures";
import { projectsRouter } from "@/modules/projects/server/procedures";
import { clientsRouter } from "@/modules/clients/server/procedures";
export const appRouter = createTRPCRouter({
  workspaces: workspaceRouter,
  invitations: invitationRouter,
  members: membersRouter,
  projects: projectsRouter,
  clients: clientsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
