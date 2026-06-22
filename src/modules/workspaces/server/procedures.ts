import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schema";
import { z } from "zod";
import { MemberRole } from "@/modules/members/types";
import { TaskStatus } from "@/generated/prisma/browser";
import { logActivity } from "@/lib/activity";
import { resolveRolePermissions } from "@/lib/permissions";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export const workspaceRouter = createTRPCRouter({
  getRole: protectedProcedure
    .input(z.object({ workspaceId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const role = await resolveRolePermissions(ctx, input.workspaceId);
      return {
        isClient: role.isClient,
        role: role.member?.role ?? null,
        isOwner: role.isOwner,
        isAdmin: role.isAdmin,
      };
    }),

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

        const ownerMember = await prisma.workspaceMember.create({
          data: {
            userId: ctx.auth.userId,
            workspaceId: workspace.id,
            role: MemberRole.OWNER,
          },
        });

        // Log workspace creation activity
        await logActivity({
          action: "workspace.created",
          entityType: "Workspace",
          entityId: workspace.id,
          workspaceId: workspace.id,
          memberId: ownerMember.id,
          metadata: { name: input.name },
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
    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId: ctx.auth.userId } } },
      orderBy: { updatedAt: "desc" },
    });
    return workspaces;
  }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "ID is required"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      const existingWorkspace = await prisma.workspace.findUnique({
        where: {
          id: input.id,
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
  update: protectedProcedure
    .input(updateWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (
        member.role !== MemberRole.OWNER &&
        member.role !== MemberRole.ADMIN
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this workspace",
        });
      }

      try {
        const updatedWorkspace = await prisma.workspace.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            slug: input.name.toLowerCase().replace(/\s+/g, "-"),
          },
        });

        // Log workspace update activity
        await logActivity({
          action: "workspace.updated",
          entityType: "Workspace",
          entityId: input.id,
          workspaceId: input.id,
          memberId: member.id,
          metadata: { name: input.name },
        });

        return updatedWorkspace;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A workspace with that name already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while updating the workspace",
        });
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1, "ID is required") }))
    .mutation(async ({ ctx, input }) => {
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (member.role !== MemberRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this workspace",
        });
      }

      // Log workspace deletion activity
      await logActivity({
        action: "workspace.deleted",
        entityType: "Workspace",
        entityId: input.id,
        workspaceId: input.id,
        memberId: member.id,
      });

      await prisma.workspace.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),

  getWorkspaceAnalytics: protectedProcedure
    .input(z.object({ workspaceId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: input.workspaceId,
          userId: ctx.auth.userId,
        },
      });

      const client = await prisma.client.findFirst({
        where: {
          userId: ctx.auth.userId,
          projects: {
            some: {
              workspaceId: input.workspaceId,
            },
          },
        },
      });

      if (!member && !client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // --- Total tasks ---
      const [taskCount, thisMonthTaskCount, lastMonthTaskCount] =
        await Promise.all([
          prisma.task.count({
            where: { project: { workspaceId: input.workspaceId } },
          }),
          prisma.task.count({
            where: {
              project: { workspaceId: input.workspaceId },
              createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
            },
          }),
          prisma.task.count({
            where: {
              project: { workspaceId: input.workspaceId },
              createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
            },
          }),
        ]);
      const taskDifference = thisMonthTaskCount - lastMonthTaskCount;

      // Assigned tasks
      const [
        assignedTaskCount,
        thisMonthAssignedCount,
        lastMonthAssignedCount,
      ] = await Promise.all([
        prisma.task.count({
          where: {
            project: { workspaceId: input.workspaceId },
            assigneeId: member?.id,
          },
        }),
        prisma.task.count({
          where: {
            project: { workspaceId: input.workspaceId },
            assigneeId: member?.id,
            createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
          },
        }),
        prisma.task.count({
          where: {
            project: { workspaceId: input.workspaceId },
            assigneeId: member?.id,
            createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
          },
        }),
      ]);
      const assignedTaskDifference =
        thisMonthAssignedCount - lastMonthAssignedCount;

      // --- Incomplete tasks ---
      const [
        incompleteTaskCount,
        thisMonthIncompleteCount,
        lastMonthIncompleteCount,
      ] = await Promise.all([
        prisma.task.count({
          where: {
            project: { workspaceId: input.workspaceId },
            status: { not: TaskStatus.DONE },
          },
        }),
        prisma.task.count({
          where: {
            project: { workspaceId: input.workspaceId },
            status: { not: TaskStatus.DONE },
            createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
          },
        }),
        prisma.task.count({
          where: {
            project: { workspaceId: input.workspaceId },
            status: { not: TaskStatus.DONE },
            createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
          },
        }),
      ]);
      const incompleteTaskDifference =
        thisMonthIncompleteCount - lastMonthIncompleteCount;

      // --- Completed tasks ---
      const [
        completedTaskCount,
        thisMonthCompletedCount,
        lastMonthCompletedCount,
      ] = await Promise.all([
        prisma.task.count({
          where: {
            project: { workspaceId: input.workspaceId },
            status: TaskStatus.DONE,
          },
        }),
        prisma.task.count({
          where: {
            project: { workspaceId: input.workspaceId },
            status: TaskStatus.DONE,
            createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
          },
        }),
        prisma.task.count({
          where: {
            project: { workspaceId: input.workspaceId },
            status: TaskStatus.DONE,
            createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
          },
        }),
      ]);
      const completedTaskDifference =
        thisMonthCompletedCount - lastMonthCompletedCount;

      // --- Overdue tasks ---
      const [overdueTaskCount, lastMonthOverdueCount] = await Promise.all([
        prisma.task.count({
          where: {
            project: { workspaceId: input.workspaceId },
            dueDate: { lt: now },
            status: { not: TaskStatus.DONE },
          },
        }),
        prisma.task.count({
          where: {
            project: { workspaceId: input.workspaceId },
            dueDate: { lt: subMonths(now, 1) },
            status: { not: TaskStatus.DONE },
          },
        }),
      ]);
      const overdueTaskDifference = overdueTaskCount - lastMonthOverdueCount;

      return {
        taskCount,
        taskDifference,
        assignedTaskCount,
        assignedTaskDifference,
        incompleteTaskCount,
        incompleteTaskDifference,
        completedTaskCount,
        completedTaskDifference,
        overdueTaskCount,
        overdueTaskDifference,
      };
    }),
});
