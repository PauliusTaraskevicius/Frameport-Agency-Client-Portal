import { TaskStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { MemberRole } from "@/modules/members/types";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { logActivity } from "@/lib/activity";
import {
  resolveProjectPermissions,
  resolveRolePermissions,
  requireTeamMember,
} from "@/lib/permissions";

import z from "zod";

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Name is required")
          .max(255, "Name is too long"),
        description: z.string().max(1024, "Description is too long").optional(),
        workspaceId: z.string().min(1),
        clientId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const role = await resolveRolePermissions(ctx, input.workspaceId);
      requireTeamMember(role);

      try {
        const project = await prisma.project.create({
          data: {
            name: input.name,
            description: input.description,
            workspaceId: input.workspaceId,
            clientId: input.clientId,
          },
        });

        // Log project creation activity
        await logActivity({
          action: "project.created",
          entityType: "Project",
          entityId: project.id,
          workspaceId: input.workspaceId,
          projectId: project.id,
          memberId: role.member!.id,
          metadata: { name: input.name },
        });

        return project;
      } catch (error) {
        const existingProject = await prisma.project.findFirst({
          where: { name: input.name, workspaceId: input.workspaceId },
        });

        if (existingProject) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A project with this name already exists in this workspace",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while creating the project",
        });
      }
    }),

  getMany: protectedProcedure
    .input(z.object({ workspaceId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const projects = await prisma.project.findMany({
          where: {
            workspaceId: input.workspaceId,
            OR: [
              // Team members see all projects in their workspaces
              {
                workspace: {
                  members: {
                    some: {
                      userId: ctx.auth.userId,
                    },
                  },
                },
              },
              // Clients see only projects assigned to them
              {
                client: {
                  userId: ctx.auth.userId,
                },
              },
            ],
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return projects;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching projects",
        });
      }
    }),

  getOne: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: project.workspaceId,
          userId: ctx.auth.userId,
        },
      });

      const client = await prisma.client.findFirst({
        where: {
          userId: ctx.auth.userId,
          projects: {
            some: {
              id: input.projectId,
            },
          },
        },
      });

      if (!member && !client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      return project;
    }),

  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        name: z
          .string()
          .min(1, "Name is required")
          .max(255, "Name is too long"),
        description: z.string().max(1024, "Description is too long").optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const role = await resolveProjectPermissions(ctx, input.projectId);
      requireTeamMember(role);

      try {
        const updatedProject = await prisma.project.update({
          where: {
            id: input.projectId,
          },
          data: {
            name: input.name,
            description: input.description,
          },
        });

        // Log project update activity
        await logActivity({
          action: "project.updated",
          entityType: "Project",
          entityId: input.projectId,
          workspaceId: project.workspaceId,
          projectId: input.projectId,
          memberId: role.member!.id,
          metadata: { name: input.name },
        });

        return updatedProject;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A project with that name already exists in this workspace",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while updating the project",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // First, fetch the project
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const role = await resolveProjectPermissions(ctx, input.projectId);
      requireTeamMember(role);

      if (
        role.member!.role !== MemberRole.OWNER &&
        role.member!.role !== MemberRole.ADMIN
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this project",
        });
      }

      await prisma.project.delete({
        where: {
          id: input.projectId,
        },
      });

      // Log project deletion activity
      await logActivity({
        action: "project.deleted",
        entityType: "Project",
        entityId: input.projectId,
        workspaceId: project.workspaceId,
        memberId: role.member!.id,
        metadata: { name: project.name },
      });

      return { success: true };
    }),
  getProjectAnalytics: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: project.workspaceId,
          userId: ctx.auth.userId,
        },
      });

      const client = await prisma.client.findFirst({
        where: {
          userId: ctx.auth.userId,
          projects: {
            some: {
              id: input.projectId,
            },
          },
        },
      });

      if (!member && !client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
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
          prisma.task.count({ where: { projectId: input.projectId } }),
          prisma.task.count({
            where: {
              projectId: input.projectId,
              createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
            },
          }),
          prisma.task.count({
            where: {
              projectId: input.projectId,
              createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
            },
          }),
        ]);
      const taskDifference = thisMonthTaskCount - lastMonthTaskCount;

      // --- Assigned tasks ---
      const [
        assignedTaskCount,
        thisMonthAssignedCount,
        lastMonthAssignedCount,
      ] = await Promise.all([
        prisma.task.count({
          where: { projectId: input.projectId, assigneeId: member?.id },
        }),
        prisma.task.count({
          where: {
            projectId: input.projectId,
            assigneeId: member?.id,
            createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
          },
        }),
        prisma.task.count({
          where: {
            projectId: input.projectId,
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
            projectId: input.projectId,
            status: { not: TaskStatus.DONE },
          },
        }),
        prisma.task.count({
          where: {
            projectId: input.projectId,
            status: { not: TaskStatus.DONE },
            createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
          },
        }),
        prisma.task.count({
          where: {
            projectId: input.projectId,
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
          where: { projectId: input.projectId, status: TaskStatus.DONE },
        }),
        prisma.task.count({
          where: {
            projectId: input.projectId,
            status: TaskStatus.DONE,
            createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
          },
        }),
        prisma.task.count({
          where: {
            projectId: input.projectId,
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
            projectId: input.projectId,
            dueDate: { lt: now },
            status: { not: TaskStatus.DONE },
          },
        }),
        prisma.task.count({
          where: {
            projectId: input.projectId,
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
