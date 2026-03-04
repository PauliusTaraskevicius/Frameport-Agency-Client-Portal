import { workspaceRouter } from "@/modules/workspaces/server/procedures";
import { createTRPCRouter } from "../init";
export const appRouter = createTRPCRouter({
  workspaces: workspaceRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
