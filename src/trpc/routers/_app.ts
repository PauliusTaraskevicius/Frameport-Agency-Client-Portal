import { workspaceRouter } from "@/modules/workspaces/server/procedures";
import { createTRPCRouter } from "../init";
import { invitationRouter } from "@/modules/invitations/server/procedures";
export const appRouter = createTRPCRouter({
  workspaces: workspaceRouter,
  invitations: invitationRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
