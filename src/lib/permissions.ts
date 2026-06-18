import { prisma } from "./db";
import { MemberRole } from "@/modules/members/types";
import { TRPCError } from "@trpc/server";

export interface RolePermissions {
  member: {
    id: string;
    role: MemberRole;
    userId: string;
    workspaceId: string;
  } | null;
  client: {
    id: string;
    userId: string | null;
    workspaceId: string;
  } | null;
  isClient: boolean;
  isTeamMember: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

export async function resolveRolePermissions(
  ctx: { auth: { userId: string } },
  workspaceId: string,
): Promise<RolePermissions> {
  const [member, client] = await Promise.all([
    prisma.workspaceMember.findFirst({
      where: { userId: ctx.auth.userId, workspaceId },
    }),
    prisma.client.findFirst({
      where: { userId: ctx.auth.userId, workspaceId },
    }),
  ]);

  const isClientViaRole = member?.role === MemberRole.CLIENT;
  const isClientViaModel = !!client;
  const isClient = isClientViaRole || isClientViaModel;
  const isOwner = member?.role === MemberRole.OWNER;
  const isAdmin = member?.role === MemberRole.ADMIN;
  const isTeamMember = !!member && !isClient;

  if (!member && !client) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this workspace",
    });
  }

  return {
    member: member
      ? {
          id: member.id,
          role: member.role as MemberRole,
          userId: member.userId,
          workspaceId: member.workspaceId,
        }
      : null,
    client: client
      ? {
          id: client.id,
          userId: client.userId,
          workspaceId: client.workspaceId,
        }
      : null,
    isClient,
    isTeamMember,
    isOwner,
    isAdmin,
  };
}

export interface ProjectPermissions extends RolePermissions {
  project: {
    id: string;
    workspaceId: string;
    clientId: string;
  };
}

export async function resolveProjectPermissions(
  ctx: { auth: { userId: string } },
  projectId: string,
): Promise<ProjectPermissions> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, workspaceId: true, clientId: true },
  });

  if (!project) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
  }

  const role = await resolveRolePermissions(ctx, project.workspaceId);

  // Clients with a Client model record can only access their own projects
  if (role.client && project.clientId !== role.client.id) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this project",
    });
  }

  return { ...role, project };
}

export function requireTeamMember(role: RolePermissions): void {
  if (role.isClient) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Clients do not have permission to perform this action",
    });
  }
}

export function requireOwnerOrAdmin(role: RolePermissions): void {
  if (!role.isOwner && !role.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only owners and admins can perform this action",
    });
  }
}
