import { prisma } from "@/lib/db";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { createInvitationSchema, acceptInvitationSchema } from "../schema";
import { z } from "zod";
import { addDays } from "date-fns";
import { sendInvitationEmail } from "../utils";
import { InvitationStatus } from "../types";
import { MemberRole } from "@/modules/members/types";
import { logActivity } from "@/lib/activity";

export const invitationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the current user is the workspace owner
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.userId,
            workspaceId: input.workspaceId,
          },
        },
      });

      if (!membership || membership.role !== "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace owners can send invitations",
        });
      }

      // Check for existing pending invitation
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          email: input.email,
          workspaceId: input.workspaceId,
          status: InvitationStatus.PENDING,
        },
      });

      if (existingInvitation) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An invitation has already been sent to this email",
        });
      }

      // Check if user is already a member
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        const existingMember = await prisma.workspaceMember.findUnique({
          where: {
            userId_workspaceId: {
              userId: existingUser.clerkUserId,
              workspaceId: input.workspaceId,
            },
          },
        });

        if (existingMember) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This user is already a member of the workspace",
          });
        }
      }

      const invitation = await prisma.invitation.create({
        data: {
          email: input.email,
          workspaceId: input.workspaceId,
          clientId: input.clientId ?? null,
          role: MemberRole.MEMBER,
          status: InvitationStatus.PENDING,
          expiresAt: addDays(new Date(), 7), // 7-day expiry
        },
      });

      // Send the magic link email (see Step 2)
      await sendInvitationEmail({
        email: input.email,
        token: invitation.token,
        workspaceId: input.workspaceId,
      });

      // Log member invitation activity
      await logActivity({
        action: "member.invited",
        entityType: "Member",
        entityId: invitation.id,
        workspaceId: input.workspaceId,
        memberId: membership.id,
        metadata: { email: input.email, role: MemberRole.MEMBER },
      });

      return invitation;
    }),

  // Accept invitation — requires the user to be signed in
  accept: protectedProcedure
    .input(acceptInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const invitation = await prisma.invitation.findUnique({
        where: { token: input.token },
        include: { workspace: true },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invitation has already been ${invitation.status.toLowerCase()}`,
        });
      }

      if (new Date() > invitation.expiresAt) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      // Verify the signed-in user's email matches the invitation
      const user = await prisma.user.findUnique({
        where: { clerkUserId: ctx.auth.userId },
      });

      if (!user || user.email !== invitation.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This invitation was sent to a different email address",
        });
      }

      // Branch based on invitation type
      if (invitation.clientId) {
        // Client invitation — link the Client record to this user
        const [updatedInvitation, updatedClient] = await prisma.$transaction([
          prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: InvitationStatus.ACCEPTED },
          }),
          prisma.client.update({
            where: { id: invitation.clientId },
            data: { userId: ctx.auth.userId },
          }),
        ]);

        return { invitation: updatedInvitation, client: updatedClient };
      } else {
        // Team member invitation — create WorkspaceMember
        const [updatedInvitation, member] = await prisma.$transaction([
          prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: InvitationStatus.ACCEPTED },
          }),
          prisma.workspaceMember.create({
            data: {
              userId: ctx.auth.userId,
              workspaceId: invitation.workspaceId,
              role: invitation.role,
            },
          }),
        ]);

        return { invitation: updatedInvitation, member };
      }
    }),

  // Validate a token (public — used on the accept page before sign-in)
  validate: baseProcedure
    .input(acceptInvitationSchema)
    .query(async ({ input }) => {
      const invitation = await prisma.invitation.findUnique({
        where: { token: input.token },
        include: {
          workspace: { select: { name: true, slug: true } },
        },
      });

      if (!invitation) {
        return { valid: false, reason: "not_found" as const };
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        return {
          valid: false,
          reason: invitation.status.toLowerCase() as
            | "accepted"
            | "expired"
            | "revoked",
        };
      }

      if (new Date() > invitation.expiresAt) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });
        return { valid: false, reason: "expired" as const };
      }

      return {
        valid: true,
        email: invitation.email,
        workspaceName: invitation.workspace.name,
        workspaceSlug: invitation.workspace.slug,
      };
    }),

  revoke: protectedProcedure
    .input(acceptInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const invitation = await prisma.invitation.findUnique({
        where: { token: input.token },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      // Verify ownership
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.userId,
            workspaceId: invitation.workspaceId,
          },
        },
      });

      if (!membership || membership.role !== MemberRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners can revoke invitations",
        });
      }

      const revokedInvitation = await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.REVOKED },
      });

      // await prisma.invitation.delete({
      //   where: { id: revokedInvitation.id },
      // });

      return revokedInvitation;
    }),

  reset: protectedProcedure
    .input(acceptInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const invitation = await prisma.invitation.findUnique({
        where: { token: input.token },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.userId,
            workspaceId: invitation.workspaceId,
          },
        },
      });

      if (!membership || membership.role !== MemberRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners can reset invitations",
        });
      }

      const newToken = crypto.randomUUID();

      const updatedInvitation = await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          token: newToken,
          expiresAt: addDays(new Date(), 7),
          status: InvitationStatus.PENDING,
        },
      });

      await sendInvitationEmail({
        email: updatedInvitation.email,
        token: updatedInvitation.token,
        workspaceId: updatedInvitation.workspaceId,
      });

      return updatedInvitation;
    }),

  getByWorkspace: protectedProcedure
    .input(z.object({ workspaceId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.auth.userId,
            workspaceId: input.workspaceId,
          },
        },
      });

      if (!membership || membership.role !== "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace owners can view invitations",
        });
      }

      return prisma.invitation.findMany({
        where: {
          workspaceId: input.workspaceId,
          status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});
