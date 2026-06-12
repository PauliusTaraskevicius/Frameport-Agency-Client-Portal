import { prisma } from "@/lib/db";
import {
  deleteS3Object,
  generateDownloadUrl,
  generatePresignedGetUrl,
  generatePresignedUrl,
} from "@/lib/s3";
import { MemberRole } from "@/modules/members/types";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { Status } from "../types";

export const filesRouter = createTRPCRouter({
  submitForApproval: protectedProcedure
    .input(
      z.object({
        approvalId: z.string().min(1),
        status: z.enum([
          Status.APPROVED,
          Status.REJECTED,
          Status.REVISION_REQUESTED,
        ]),
        note: z.string().max(1024).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const approval = await prisma.approval.findUnique({
        where: { id: input.approvalId },
        include: {
          fileVersion: { include: { file: { include: { project: true } } } },
        },
      });

      if (!approval) throw new TRPCError({ code: "NOT_FOUND" });
      if (approval.status !== "PENDING")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already resolved",
        });

      // only the assigned client can approve
      const client = await prisma.client.findFirst({
        where: { userId: ctx.auth.userId, id: approval.clientId },
      });
      if (!client) throw new TRPCError({ code: "FORBIDDEN" });

      const project = approval.fileVersion?.file?.project;

      if (!project || project.clientId !== client.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Client does not belong to this project",
        });
      }

      return prisma.approval.update({
        where: { id: input.approvalId },
        data: { status: input.status, note: input.note },
      });
    }),

  requestApproval: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        fileVersionId: z.string().min(1),
        clientId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspace: { projects: { some: { id: input.projectId } } },
          userId: ctx.auth.userId,
        },
      });

      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      // prevent duplicate pending approval for same version
      const existing = await prisma.approval.findFirst({
        where: {
          fileVersionId: input.fileVersionId,
          clientId: input.clientId,
          status: "PENDING",
        },
      });

      if (existing)
        throw new TRPCError({ code: "CONFLICT", message: "Already pending" });

      return prisma.approval.create({
        data: {
          projectId: input.projectId,
          fileVersionId: input.fileVersionId,
          clientId: input.clientId,
          status: "PENDING",
        },
      });
    }),

  addVersion: protectedProcedure
    .input(
      z.object({
        fileId: z.string().min(1),
        key: z.string(),
        url: z.string().url(),
        mimeType: z.string().optional(),
        size: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const file = await prisma.file.findUnique({
        where: { id: input.fileId },
        include: {
          project: true,
          versions: {
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      // only team members can upload revisions
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: file.project.workspaceId,
          userId: ctx.auth.userId,
        },
      });

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const nextVersion = (file.versions[0]?.version ?? 0) + 1;

      return prisma.$transaction([
        prisma.fileVersion.create({
          data: {
            fileId: input.fileId,
            version: nextVersion,
            key: input.key,
            url: input.url,
            mimeType: input.mimeType,
            size: input.size,
          },
        }),
        // keep File.key/url pointing to latest
        prisma.file.update({
          where: { id: input.fileId },
          data: { key: input.key, url: input.url },
        }),
      ]);
    }),

  getVersions: protectedProcedure
    .input(z.object({ fileId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const file = await prisma.file.findUnique({
        where: { id: input.fileId },
        include: { project: true },
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

      const versions = await prisma.fileVersion.findMany({
        where: { fileId: input.fileId },
        orderBy: { version: "desc" },
        include: {
          approvals: {
            include: {
              client: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1, // latest approval per version
          },
        },
      });

      return versions;
    }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ fileId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const file = await prisma.file.findUnique({
        where: { id: input.fileId },
        include: { project: true },
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
        url: await generateDownloadUrl(file.key, file.name),
      };
    }),

  createComment: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1),
        fileId: z.string().min(1),
        taskId: z.string().min(1).optional(),
        body: z.string().min(1).max(1024),
        parentId: z.string().min(1).optional(),
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
        if (!parent || parent.fileId !== input.fileId) {
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
      if (comment.authorId !== member?.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      // Cascade on parentId handles reply deletion
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
      if (comment.authorId !== member?.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await prisma.comments.update({
        where: { id: input.commentId },
        data: {
          body: input.body,
        },
      });
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
        where: { fileId: input.fileId, parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            include: {
              user: true,
            },
          },
          client: true,
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                include: {
                  user: true,
                },
              },
              client: true,
            },
          },
        },
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
              versions: {
                create: {
                  version: 1,
                  key: f.key,
                  url: f.url,
                  mimeType: f.mimeType,
                  size: f.size,
                },
              },
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
