import { prisma } from "@/lib/db";
import { generatePresignedUrl } from "@/lib/s3";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const filesRouter = createTRPCRouter({
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

      return prisma.file.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
        include: { uploader: true },
      });
    }),
});
