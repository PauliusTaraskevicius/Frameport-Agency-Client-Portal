import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";

export const clientsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(z.object({ workspaceId: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const clients = await prisma.client.findMany({
          where: {
            workspaceId: input.workspaceId,
          },
        });
        return clients;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching clients",
        });
      }
    }),
});
