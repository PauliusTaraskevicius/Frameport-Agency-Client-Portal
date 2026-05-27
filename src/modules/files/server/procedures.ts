import { prisma } from "@/lib/db";
import {
  deleteS3Object,
  generatePresignedGetUrl,
  generatePresignedUrl,
} from "@/lib/s3";
import { MemberRole } from "@/modules/members/types";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const filesRouter = createTRPCRouter({
  createComment: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        fileId: z.string().min(1),
        body: z.string().min(1).max(1024),
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

      const file = await prisma.file.findUnique({
        where: { id: input.fileId },
      });

      if (!file || file.projectId !== input.projectId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }
      const member = await prisma.workspaceMember.findFirst({
        where: { workspaceId: project.workspaceId, userId: ctx.auth.userId },
      });

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const comment = await prisma.comments.create({
        data: {
          body: input.body,
          authorId: member.id,
          fileId: input.fileId,
        },
      });

      return comment;
    }),

  getCommentsByFile: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        fileId: z.string().min(1),
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
        where: { fileId: input.fileId, file: { projectId: input.projectId } },
        orderBy: { createdAt: "asc" },
      });

      return comments;
    }),
  getPresignedUrls: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        files: z
          .array(z.object({ name: z.string(), mimeType: z.string() }))
          .min(1)
          .max(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
      if (!member)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      return Promise.all(
        input.files.map((f) =>
          generatePresignedUrl(f.name, f.mimeType, input.projectId),
        ),
      );
    }),

  saveFiles: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        files: z
          .array(
            z.object({
              name: z.string(),
              key: z.string(),
              url: z.string().url(),
              mimeType: z.string().optional(),
              size: z.number().optional(),
            }),
          )
          .min(1)
          .max(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
      if (!member)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      return prisma.$transaction(
        input.files.map((f) =>
          prisma.file.create({
            data: {
              name: f.name,
              key: f.key,
              url: f.url,
              mimeType: f.mimeType,
              size: f.size,
              projectId: input.projectId,
              uploadedById: member.id,
            },
          }),
        ),
      );
    }),

  getMany: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
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

      const files = await prisma.file.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
        include: { uploader: true, project: true },
      });

      return Promise.all(
        files.map(async (file) => ({
          ...file,
          url: await generatePresignedGetUrl(file.key),
        })),
      );
    }),

  getOne: protectedProcedure
    .input(z.object({ fileId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const file = await prisma.file.findUnique({
        where: { id: input.fileId },
        include: { uploader: true, project: true },
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: file.project.workspaceId,
          userId: ctx.auth.userId,
        },
      });

      const client = await prisma.client.findFirst({
        where: {
          userId: ctx.auth.userId,
          projects: { some: { id: file.projectId } },
        },
      });

      if (!member && !client) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return {
        ...file,
        url: await generatePresignedGetUrl(file.key),
      };
    }),

  delete: protectedProcedure
    .input(z.object({ fileId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const file = await prisma.file.findUnique({
        where: { id: input.fileId },
        include: { project: true },
      });
      if (!file)
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });

      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: file.project.workspaceId,
          userId: ctx.auth.userId,
        },
      });
      if (!member)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

      if (
        member.role !== MemberRole.OWNER &&
        member.role !== MemberRole.ADMIN &&
        member.role !== MemberRole.MEMBER
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this file",
        });
      }

      await deleteS3Object(file.key);

      await prisma.file.delete({
        where: { id: input.fileId },
      });

      return { success: true };
    }),
});
