import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schema";
import { z } from "zod";
import { MemberRole } from "@/modules/members/types";
import { TaskStatus } from "@/generated/prisma/browser";

import { startOfMonth, endOfMonth, subMonths } from "date-fns";

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

        await prisma.workspaceMember.create({
          data: {
            userId: ctx.auth.userId,
            workspaceId: workspace.id,
            role: MemberRole.OWNER,
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
      const membershipCount = await prisma.workspaceMember.count({
        where: {
          userId: ctx.auth.userId,
        },
      });

      if (membershipCount === 0) {
        return [];
      }

      const workspaces = await prisma.workspace.findMany({
        where: {
          members: {
            some: {
              userId: ctx.auth.userId,
            },
          },
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

      if (
        member.role !== MemberRole.OWNER &&
        member.role !== MemberRole.ADMIN
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this workspace",
        });
      }

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

      const thisMonthTasks = await prisma.task.findMany({
        where: {
          project:{
            workspaceId: input.workspaceId,
          },
          createdAt: {
            gte: thisMonthStart,
            lte: thisMonthEnd,
          },
        },
      });

      const lastMonthTasks = await prisma.task.findMany({
        where: {
          project: {
            workspaceId: input.workspaceId,
          },
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      });

      const taskCount = thisMonthTasks.length;

      const taskDifference = taskCount - lastMonthTasks.length;

      const thisMonthAssignedTasks = await prisma.task.findMany({
        where: {
          project: {
            workspaceId: input.workspaceId,
          },
          assigneeId: member?.id,
          createdAt: {
            gte: thisMonthStart,
            lte: thisMonthEnd,
          },
        },
      });

      const lastMonthAssignedTasks = await prisma.task.findMany({
        where: {
          project: {
            workspaceId: input.workspaceId,
          },
          assigneeId: member?.id,
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      });

      const assignedTaskCount = thisMonthAssignedTasks.length;

      const assignedTaskDifference =
        assignedTaskCount - lastMonthAssignedTasks.length;

      const thisMonthIncompleteTasks = await prisma.task.findMany({
        where: {
          project: {
            workspaceId: input.workspaceId,
          },
          status: {
            not: TaskStatus.DONE,
          },
          createdAt: {
            gte: thisMonthStart,
            lte: thisMonthEnd,
          },
        },
      });

      const lastMonthIncompleteTasks = await prisma.task.findMany({
        where: {
          project: {
            workspaceId: input.workspaceId,
          },
          status: {
            not: TaskStatus.DONE,
          },
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      });

      const incompleteTaskCount = thisMonthIncompleteTasks.length;
      const incompleteTaskDifference =
        incompleteTaskCount - lastMonthIncompleteTasks.length;

      const thisMonthCompletedTasks = await prisma.task.findMany({
        where: {
          project: {
            workspaceId: input.workspaceId,
          },
          status: TaskStatus.DONE,
          createdAt: {
            gte: thisMonthStart,
            lte: thisMonthEnd,
          },
        },
      });

      const lastMonthsCompletedTasks = await prisma.task.findMany({
        where: {
          project: {
            workspaceId: input.workspaceId,
          },
          status: TaskStatus.DONE,
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      });

      const completedTaskCount = thisMonthCompletedTasks.length;
      const completedTaskDifference =
        completedTaskCount - lastMonthsCompletedTasks.length;

      const thisMonthsOverdueTasks = await prisma.task.findMany({
        where: {
          project: {
            workspaceId: input.workspaceId,
          },
          dueDate: {
            lt: now,
          },
          status: {
            not: TaskStatus.DONE,
          },
        },
      });

      const lastMonthsOverdueTasks = await prisma.task.findMany({
        where: {
          project: {
            workspaceId: input.workspaceId,
          },
          dueDate: {
            lt: subMonths(now, 1),
          },
          status: {
            not: TaskStatus.DONE,
          },
        },
      });

      const overdueTaskCount = thisMonthsOverdueTasks.length;
      const overdueTaskDifference =
        overdueTaskCount - lastMonthsOverdueTasks.length;

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
