import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";
import {
  resolveRolePermissions,
  resolveProjectPermissions,
} from "@/lib/permissions";

export const activityRouter = createTRPCRouter({
  // Workspace-wide feed — shows everything that happened in the workspace.
  // Uses cursor pagination so the UI can load more on scroll.
  getWorkspaceFeed: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().min(1),
        limit: z.number().min(1).max(100).default(30),
        cursor: z.string().optional(), // For pagication
      }),
    )
    .query(async ({ ctx, input }) => {
      const role = await resolveRolePermissions(ctx, input.workspaceId);

      // Clients do not have access to workspace-wide feeds
      if (role.isClient) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Clients cannot view workspace-wide activity",
        });
      }

      // Fetch one extra item to know if there's a next page
      const logs = await prisma.activityLog.findMany({
        where: {
          workspaceId: input.workspaceId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          // Include member + user so the UI can show name/avatar
          member: {
            include: {
              user: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (logs.length > input.limit) {
        nextCursor = logs.pop()!.id; // trim the extra item, expose its id as cursor
      }

      return { logs, nextCursor };
    }),

  // Project-scoped feed — only logs tied to a specific project.
  getProjectFeed: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        limit: z.number().int().min(1).max(100).default(30),
        cursor: z.string().optional(), // pagination
      }),
    )
    .query(async ({ ctx, input }) => {
      await resolveProjectPermissions(ctx, input.projectId);

      const logs = await prisma.activityLog.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (logs.length > input.limit) {
        nextCursor = logs.pop()!.id;
      }

      return { logs, nextCursor };
    }),
});
