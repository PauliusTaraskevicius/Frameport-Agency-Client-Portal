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
import { logActivity } from "@/lib/activity";
import {
  resolveProjectPermissions,
  resolveRolePermissions,
  requireTeamMember,
} from "@/lib/permissions";

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

      const updated = await prisma.approval.update({
        where: { id: input.approvalId },
        data: {
          status: input.status,
          note: input.note,
        },
      });

      await logActivity({
        action: "approval.submitted",
        entityType: "Approval",
        entityId: input.approvalId,
        workspaceId: project.workspaceId,
        projectId: project.id,
        metadata: { status: input.status },
      });

      return updated;
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
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const role = await resolveRolePermissions(ctx, project.workspaceId);
      requireTeamMember(role);

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

      const approval = await prisma.approval.create({
        data: {
          projectId: input.projectId,
          fileVersionId: input.fileVersionId,
          clientId: input.clientId,
          status: "PENDING",
        },
      });

      await logActivity({
        action: "approval.requested",
        entityType: "Approval",
        entityId: approval.id,
        workspaceId: project.workspaceId,
        projectId: input.projectId,
        memberId: role.member!.id,
        metadata: {
          fileVersionId: input.fileVersionId,
          clientId: input.clientId,
        },
      });

      return approval;
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

      const role = await resolveRolePermissions(ctx, file.project.workspaceId);
      requireTeamMember(role);

      const nextVersion = (file.versions[0]?.version ?? 0) + 1;

      const result = await prisma.$transaction([
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
        prisma.file.update({
          where: { id: input.fileId },
          data: { key: input.key, url: input.url },
        }),
      ]);

      await logActivity({
        action: "file.version_added",
        entityType: "File",
        entityId: input.fileId,
        workspaceId: file.project.workspaceId,
        projectId: file.projectId,
        memberId: role.member!.id,
        metadata: { version: nextVersion, key: input.key },
      });

      return result;
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

      return Promise.all(
        versions.map(async (v) => ({
          ...v,
          url: await generatePresignedGetUrl(v.key),
        })),
      );
    }),

  getVersionDownloadUrl: protectedProcedure
    .input(z.object({ fileVersionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const version = await prisma.fileVersion.findUnique({
        where: { id: input.fileVersionId },
        include: { file: { include: { project: true } } },
      });

      if (!version) throw new TRPCError({ code: "NOT_FOUND" });

      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: version.file.project.workspaceId,
          userId: ctx.auth.userId,
        },
      });
      const client = await prisma.client.findFirst({
        where: {
          userId: ctx.auth.userId,
          projects: { some: { id: version.file.projectId } },
        },
      });
      if (!member && !client) throw new TRPCError({ code: "FORBIDDEN" });

      return {
        url: await generateDownloadUrl(version.key, version.file.name),
      };
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
      const client = await prisma.client.findFirst({
        where: {
          userId: ctx.auth.userId,
          projects: { some: { id: input.projectId } },
        },
      });

      const isAuthor = comment.authorId === member?.id || comment.clientId === client?.id;
      if (!isAuthor) throw new TRPCError({ code: "FORBIDDEN" });

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

      const role = await resolveRolePermissions(ctx, project.workspaceId);
      requireTeamMember(role);

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

      const role = await resolveRolePermissions(ctx, project.workspaceId);
      requireTeamMember(role);

      const files = await prisma.$transaction(
        input.files.map((f) =>
          prisma.file.create({
            data: {
              name: f.name,
              key: f.key,
              url: f.url,
              mimeType: f.mimeType,
              size: f.size,
              projectId: input.projectId,
              uploadedById: role.member!.id,
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

      await Promise.all(
        files.map((file) =>
          logActivity({
            action: "file.uploaded",
            entityType: "File",
            entityId: file.id,
            workspaceId: project.workspaceId,
            projectId: input.projectId,
            memberId: role.member!.id,
            metadata: {
              fileName: file.name,
              mimeType: file.mimeType,
              size: file.size,
            },
          }),
        ),
      );

      return files;
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
        isClient: !member,
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

      const role = await resolveRolePermissions(ctx, file.project.workspaceId);
      requireTeamMember(role);

      if (
        role.member!.role !== MemberRole.OWNER &&
        role.member!.role !== MemberRole.ADMIN &&
        role.member!.role !== MemberRole.MEMBER
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

      await logActivity({
        action: "file.deleted",
        entityType: "File",
        entityId: input.fileId,
        workspaceId: file.project.workspaceId,
        projectId: file.projectId,
        memberId: role.member!.id,
        metadata: { fileName: file.name },
      });

      return { success: true };
    }),
});
