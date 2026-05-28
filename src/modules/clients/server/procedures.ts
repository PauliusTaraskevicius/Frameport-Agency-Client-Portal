import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";

export const clientsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(z.object({ workspaceId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: input.workspaceId,
          userId: ctx.auth.userId,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this workspace",
        });
      }

      const clients = await prisma.client.findMany({
        where: {
          workspaceId: input.workspaceId,
        },
      });
      return clients;
    }),
});
