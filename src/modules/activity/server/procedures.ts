import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";
import {
  resolveRolePermissions,
  resolveProjectPermissions,
  requireTeamMember,
} from "@/lib/permissions";

const feedInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const activityRouter = createTRPCRouter({
  // Workspace-wide feed — shows everything that happened in the workspace.
  // Uses cursor pagination so the UI can load more on scroll.
  getWorkspaceFeed: protectedProcedure
    .input(
      feedInput.extend({
        workspaceId: z.string().min(1),
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

      const where = { workspaceId: input.workspaceId };

      const [totalCount, logs] = await Promise.all([
        prisma.activityLog.count({ where }),
        prisma.activityLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / input.limit);

      return { logs, totalCount, totalPages, currentPage: input.page };
    }),

  // Project-scoped feed — only logs tied to a specific project.
  getProjectFeed: protectedProcedure
    .input(
      feedInput.extend({
        projectId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      await resolveProjectPermissions(ctx, input.projectId);

      const where = { projectId: input.projectId };

      const [totalCount, logs] = await Promise.all([
        prisma.activityLog.count({ where }),
        prisma.activityLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / input.limit);

      return { logs, totalCount, totalPages, currentPage: input.page };
    }),

  getTaskFeed: protectedProcedure
    .input(
      feedInput.extend({
        taskId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const task = await prisma.task.findUnique({
        where: { id: input.taskId },
        select: { id: true, workspaceId: true },
      });

      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      const role = await resolveRolePermissions(ctx, task.workspaceId);
      requireTeamMember(role);

      const where = {
        entityType: "Task",
        entityId: input.taskId,
      };

      const [totalCount, logs] = await Promise.all([
        prisma.activityLog.count({ where }),
        prisma.activityLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / input.limit);

      return { logs, totalCount, totalPages, currentPage: input.page };
    }),

  getFileFeed: protectedProcedure
    .input(
      feedInput.extend({
        fileId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const file = await prisma.file.findUnique({
        where: { id: input.fileId },
        select: { id: true, projectId: true },
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      const role = await resolveRolePermissions(ctx, file.projectId);

      const where = {
        entityType: "Task",
        entityId: input.fileId,
      };

      const [totalCount, logs] = await Promise.all([
        prisma.activityLog.count({ where }),
        prisma.activityLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / input.limit);

      return { logs, totalCount, totalPages, currentPage: input.page };
    }),
});
