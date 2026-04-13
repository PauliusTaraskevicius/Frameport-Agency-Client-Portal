import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

import z from "zod";
import { TaskStatus } from "../types";

export const tasksRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z
          .string()
          .min(1, "Title is required")
          .max(255, "Title is too long"),
        description: z.string().max(1024, "Description is too long").optional(),
        projectId: z.string().min(1),
        assigneeId: z.string().min(1),
        dueDate: z.date(),
        status: z
          .enum([
            TaskStatus.TODO,
            TaskStatus.IN_PROGRESS,
            TaskStatus.REVIEW,
            TaskStatus.DONE,
          ])
          .default(TaskStatus.TODO),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the project to find its workspace
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
        },
        select: { workspaceId: true },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Check if user is a member of the workspace
      const member = await prisma.workspaceMember.findFirst({
        where: {
          userId: ctx.auth.userId,
          workspaceId: project.workspaceId,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to create tasks in this project",
        });
      }

      // Get the highest priority task in the project
      const highestPriorityTask = await prisma.task.findFirst({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          position: "desc",
        },
        select: {
          position: true,
        },
      });

      const newPosition = highestPriorityTask
        ? highestPriorityTask.position + 1000
        : 1000;

      // Check for duplicate task title in the same project
      const existingTask = await prisma.task.findFirst({
        where: {
          title: input.title,
          projectId: input.projectId,
        },
      });

      if (existingTask) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A task with this title already exists in this project",
        });
      }
      try {
        const task = await prisma.task.create({
          data: {
            title: input.title,
            description: input.description,
            projectId: input.projectId,
            assigneeId: input.assigneeId,
            dueDate: input.dueDate,
            status: input.status,
            position: newPosition,
          },
        });

        return task;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create task",
        });
      }
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().min(1),
        projectId: z.string().optional(),
        assigneeId: z.string().optional(),
        status: z
          .enum([
            TaskStatus.TODO,
            TaskStatus.IN_PROGRESS,
            TaskStatus.REVIEW,
            TaskStatus.DONE,
          ])
          .optional(),
        dueDate: z.date().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Check if user is a member of the workspace
      const member = await prisma.workspaceMember.findFirst({
        where: {
          userId: ctx.auth.userId,
          workspaceId: input.workspaceId,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view tasks in this workspace",
        });
      }

      try {
        const tasks = await prisma.task.findMany({
          where: {
            project: {
              workspaceId: input.workspaceId,
            },
            ...(input.projectId && { projectId: input.projectId }),
            ...(input.assigneeId && { assigneeId: input.assigneeId }),
            ...(input.status && { status: input.status }),
            ...(input.dueDate && { dueDate: input.dueDate }),
            ...(input.search && {
              OR: [
                { title: { contains: input.search, mode: "insensitive" } },
                {
                  description: { contains: input.search, mode: "insensitive" },
                },
              ],
            }),
          },
          orderBy: {
            position: "asc",
          },
        });

        return tasks;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching tasks",
        });
      }
    }),
});
