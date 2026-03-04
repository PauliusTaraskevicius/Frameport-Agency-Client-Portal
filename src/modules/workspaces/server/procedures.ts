import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { createWorkspaceSchema } from "../schema";
import { z } from "zod";

export const workspaceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await prisma.workspace.create({
          data: {
            userId: ctx.auth.userId,
            name: input.name,
            slug: input.name.toLowerCase().replace(/\s+/g, "-"),
          },
        });

        return workspace;
      } catch (error) {
        const slug = input.name.toLowerCase().replace(/\s+/g, "-");

        const existingWorkspace = await prisma.workspace.findUnique({
          where: { slug },
        });

        if (existingWorkspace) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A workspace with this name already exists",
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while creating the workspace",
          });
        }
      }
    }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workspaces = await prisma.workspace.findMany({
        where: {
          userId: ctx.auth.userId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      return workspaces;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occurred while fetching the workspaces",
      });
    }
  }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "ID is required"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const existingWorkspace = await prisma.workspace.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!existingWorkspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }
      return existingWorkspace;
    }),
});
