import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { MemberRole } from "../types";

export const membersRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify the caller is a member of the workspace
      const currentMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.userId,
            workspaceId: input.workspaceId,
          },
        },
      });

      if (!currentMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a member of the workspace to view its members",
        });
      }

      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId: input.workspaceId },
        include: { user: true },
      });

      return members;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the caller is a member of the workspace
      const currentMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.userId,
            workspaceId: input.workspaceId,
          },
        },
      });

      if (!currentMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a member of the workspace to remove members",
        });
      }

      if (currentMember.role !== MemberRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace owners can remove members",
        });
      }

      // Prevent owners from removing themselves
      if (input.userId === ctx.auth.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Owners cannot remove themselves from the workspace",
        });
      }

      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId: input.workspaceId },
      });

      if (members.length <= 1) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove the last member from the workspace",
        });
      }

      await prisma.workspaceMember.delete({
        where: {
          userId_workspaceId: {
            userId: input.userId,
            workspaceId: input.workspaceId,
          },
        },
      });

      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        userId: z.string(),
        role: z.enum([MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the caller is a member of the workspace
      const currentMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.userId,
            workspaceId: input.workspaceId,
          },
        },
      });

      if (!currentMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You must be a member of the workspace to update member roles",
        });
      }

      if (currentMember.role !== MemberRole.OWNER && currentMember.role !== MemberRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace owners and admins can update member roles",
        });
      }

      // Prevent owners from changing their own role
      if (input.userId === ctx.auth.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Owners or admins cannot change their own role",
        });
      }

      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId: input.workspaceId },
      });

      const targetMember = members.find(
        (member) => member.userId === input.userId,
      );
      const ownerCount = members.filter(
        (member) => member.role === MemberRole.OWNER,
      ).length;

      if (
        ownerCount <= 1 &&
        targetMember?.role === MemberRole.OWNER &&
        input.role !== MemberRole.OWNER
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot demote the last owner of the workspace",
        });
      }

      await prisma.workspaceMember.update({
        where: {
          userId_workspaceId: {
            userId: input.userId,
            workspaceId: input.workspaceId,
          },
        },
        data: {
          role: input.role,
        },
      });

      return { success: true };
    }),
});
