import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { logActivity } from "@/lib/activity";
import z from "zod";
import { TaskStatus } from "../types";
import {
  resolveRolePermissions,
  resolveProjectPermissions,
  requireTeamMember,
} from "@/lib/permissions";

export const tasksRouter = createTRPCRouter({
  createComment: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        fileId: z.string().optional(),
        taskId: z.string().optional(),
        body: z.string().min(1).max(1024),
        parentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const task = await prisma.task.findUnique({
        where: { id: input.taskId },
      });

      if (!task || task.projectId !== input.projectId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }
      const member = await prisma.workspaceMember.findFirst({
        where: { workspaceId: project.workspaceId, userId: ctx.auth.userId },
      });

      const client = await prisma.client.findFirst({
        where: {
          userId: ctx.auth.userId,
          projects: { some: { id: input.projectId } },
        },
      });

      if (!member && !client) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      if (input.parentId) {
        const parent = await prisma.comments.findUnique({
          where: { id: input.parentId },
        });
        if (!parent || (input.taskId && parent.taskId !== input.taskId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid parent comment",
          });
        }
      }

      const comment = await prisma.comments.create({
        data: {
          body: input.body,
          authorId: member?.id ?? null,
          clientId: client?.id ?? null,
          fileId: input.fileId ?? null,
          taskId: input.taskId ?? null,
          parentId: input.parentId ?? null,
        },
      });

      return comment;
    }),

  deleteComment: protectedProcedure
    .input(
      z.object({ commentId: z.string().min(1), projectId: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await prisma.comments.findUnique({
        where: { id: input.commentId },
      });
      if (!comment) throw new TRPCError({ code: "NOT_FOUND" });

      // Only author can delete
      const member = await prisma.workspaceMember.findFirst({
        where: {
          userId: ctx.auth.userId,
          workspace: { projects: { some: { id: input.projectId } } },
        },
      });
      const client = await prisma.client.findFirst({
        where: {
          userId: ctx.auth.userId,
          projects: { some: { id: input.projectId } },
        },
      });

      const isAuthor = comment.authorId === member?.id || comment.clientId === client?.id;
      if (!isAuthor) throw new TRPCError({ code: "FORBIDDEN" });

      await prisma.comments.delete({ where: { id: input.commentId } });
    }),

  updateComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string().min(1),
        projectId: z.string().min(1),
        body: z.string().min(1).max(1024),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await prisma.comments.findUnique({
        where: { id: input.commentId },
      });
      if (!comment) throw new TRPCError({ code: "NOT_FOUND" });
      // Only author can update
      const member = await prisma.workspaceMember.findFirst({
        where: {
          userId: ctx.auth.userId,
          workspace: { projects: { some: { id: input.projectId } } },
        },
      });
      const client = await prisma.client.findFirst({
        where: {
          userId: ctx.auth.userId,
          projects: { some: { id: input.projectId } },
        },
      });

      const isAuthor = comment.authorId === member?.id || comment.clientId === client?.id;
      if (!isAuthor) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await prisma.comments.update({
        where: { id: input.commentId },
        data: {
          body: input.body,
        },
      });
    }),

  getCommentsByTask: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        taskId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      // project + access check...
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });

      const member = await prisma.workspaceMember.findFirst({
        where: { workspaceId: project.workspaceId, userId: ctx.auth.userId },
      });
      const client = await prisma.client.findFirst({
        where: {
          userId: ctx.auth.userId,
          projects: { some: { id: input.projectId } },
        },
      });
      if (!member && !client)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      const comments = await prisma.comments.findMany({
        where: { taskId: input.taskId, parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: { include: { user: true } },
          client: true,
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: { include: { user: true } },
              client: true,
            },
          },
        },
      });

      return comments;
    }),

  update: protectedProcedure
    .input(
      z.object({
        taskId: z.string().min(1),
        title: z
          .string()
          .min(1, "Title is required")
          .max(255, "Title is too long")
          .optional(),
        description: z.string().max(1024, "Description is too long").optional(),
        assigneeId: z.string().min(1, "Assignee is required").optional(),
        projectId: z.string().min(1).optional(),
        dueDate: z.date().optional(),
        position: z.number().optional(),
        status: z
          .enum([
            TaskStatus.TODO,
            TaskStatus.IN_PROGRESS,
            TaskStatus.REVIEW,
            TaskStatus.DONE,
          ])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the task to find its project and workspace
      const task = await prisma.task.findUnique({
        where: {
          id: input.taskId,
        },
      });

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      // Get the project to find its workspace
      const project = await prisma.project.findUnique({
        where: {
          id: task.projectId,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (input.projectId && input.projectId !== task.projectId) {
        const targetProject = await prisma.project.findUnique({
          where: { id: input.projectId },
          select: { workspaceId: true },
        });
        if (
          !targetProject ||
          targetProject.workspaceId !== project.workspaceId
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot move a task to a project in a different workspace",
          });
        }
      }

      const role = await resolveProjectPermissions(ctx, task.projectId);
      requireTeamMember(role);

      try {
        const updatedTask = await prisma.task.update({
          where: {
            id: input.taskId,
          },
          data: {
            title: input.title,
            description: input.description,
            assigneeId: input.assigneeId,
            dueDate: input.dueDate,
            status: input.status,
            projectId: input.projectId,
          },
        });

        if (input.status && input.status !== task.status && role.member) {
          await logActivity({
            action: "task.status_changed",
            entityType: "Task",
            entityId: input.taskId,
            workspaceId: project.workspaceId,
            projectId: task.projectId,
            memberId: role.member.id,
            metadata: { from: task.status, to: input.status },
          });
        }

        return updatedTask;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A task with that name already exists in this project",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while updating the task",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ taskId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Get the task to find its project and workspace
      const task = await prisma.task.findUnique({
        where: {
          id: input.taskId,
        },
        select: {
          projectId: true,
          title: true,
        },
      });
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }
      const project = await prisma.project.findUnique({
        where: {
          id: task.projectId,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const role = await resolveProjectPermissions(ctx, task.projectId);
      requireTeamMember(role);

      await prisma.task.delete({
        where: {
          id: input.taskId,
        },
      });

      if (role.member) {
        await logActivity({
          action: "task.deleted",
          entityType: "Task",
          entityId: input.taskId,
          workspaceId: project.workspaceId,
          projectId: task.projectId,
          memberId: role.member.id,
          metadata: { title: task.title },
        });
      }

      return { success: true };
    }),
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

      const role = await resolveRolePermissions(ctx, project.workspaceId);
      requireTeamMember(role);

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

        await logActivity({
          action: "task.created",
          entityType: "Task",
          entityId: task.id,
          workspaceId: project.workspaceId,
          projectId: input.projectId,
          memberId: role.member!.id,
          metadata: { title: input.title, status: input.status },
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
      const role = await resolveRolePermissions(ctx, input.workspaceId);

      // Clients can only view tasks for projects they are assigned to
      const projectFilter = role.client
        ? { project: { workspaceId: input.workspaceId, clientId: role.client.id } }
        : { project: { workspaceId: input.workspaceId } };

      try {
        const tasks = await prisma.task.findMany({
          where: {
            ...projectFilter,
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
          include: {
            project: true,
            assignee: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        });

        return tasks.map((task) => ({
          ...task,
          assignee: task.assignee
            ? {
                ...task.assignee,
                user: {
                  name: [task.assignee.user.firstName, task.assignee.user.lastName]
                    .filter(Boolean)
                    .join(" "),
                },
              }
            : null,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching tasks",
        });
      }
    }),

  getOne: protectedProcedure
    .input(z.object({ taskId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      // Get the task to find its project and workspace
      const task = await prisma.task.findUnique({
        where: {
          id: input.taskId,
        },
        include: {
          project: true,
          assignee: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      await resolveProjectPermissions(ctx, task.projectId);

      return {
        ...task,
        assignee: task.assignee
          ? {
              ...task.assignee,
              user: {
                name: [task.assignee.user.firstName, task.assignee.user.lastName]
                  .filter(Boolean)
                  .join(" "),
              },
            }
          : null,
      };
    }),
  bulk: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string().min(1),
          status: z.enum([
            TaskStatus.TODO,
            TaskStatus.IN_PROGRESS,
            TaskStatus.REVIEW,
            TaskStatus.DONE,
          ]),
          position: z.number().min(0),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const tasks = await prisma.task.findMany({
        where: {
          id: { in: input.map((t) => t.id) },
        },
        // FIX: include id + status so we can map old status and find tasks by id
        select: {
          id: true,
          projectId: true,
          status: true,
        },
      });

      if (tasks.length !== input.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more tasks not found",
        });
      }

      // Get unique project IDs and resolve their workspace IDs
      const projectIds = [...new Set(tasks.map((t) => t.projectId))];

      const projects = await prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { id: true, workspaceId: true },
      });

      const workspaceIds = [...new Set(projects.map((p) => p.workspaceId))];

      for (const workspaceId of workspaceIds) {
        const role = await resolveRolePermissions(ctx, workspaceId);
        requireTeamMember(role);
      }

      const updates = input.map((task) =>
        prisma.task.update({
          where: { id: task.id },
          data: {
            status: task.status,
            position: task.position,
          },
        }),
      );

      await prisma.$transaction(updates);

      const taskStatusMap = new Map(tasks.map((t) => [t.id, t.status]));

      const changedTasks = input.filter((item) => {
        const oldStatus = taskStatusMap.get(item.id);
        return oldStatus && oldStatus !== item.status;
      });

      await Promise.all(
        changedTasks.map((item) => {
      
          const taskInfo = tasks.find((t) => t.id === item.id)!;
          const projectInfo = projects.find(
            (p) => p.id === taskInfo.projectId,
          )!;
          return logActivity({
            action: "task.status_changed",
            entityType: "Task",
            entityId: item.id,
            workspaceId: projectInfo.workspaceId,
            projectId: taskInfo.projectId,
            metadata: { from: taskStatusMap.get(item.id), to: item.status },
          });
        }),
      );

      return { success: true };
    }),
});
