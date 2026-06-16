import { Prisma } from "@/generated/prisma/client";
import { prisma } from "./db";

export type ActivityAction =
  | "task.created"
  | "task.status_changed"
  | "task.deleted"
  | "file.uploaded"
  | "file.version_added"
  | "file.deleted"
  | "approval.submitted"
  | "approval.requested"
  | "member.invited"
  | "member.removed"
  | "member.role_changed"
  | "project.created"
  | "project.updated"
  | "project.deleted"
  | "project.status_changed"
  | "workspace.updated"
  | "workspace.deleted";

interface LogActivityParams {
  action: ActivityAction;
  entityType: "Task" | "File" | "Project" | "Member" | "Approval" | "Workspace";
  entityId: string;
  workspaceId: string;
  memberId?: string; // the team member who performed the action
  projectId?: string;
  metadata?: Record<string, unknown>; // any extra context for the UI
}

export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        ...params,
        metadata: params.metadata as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    console.error("[logActivity] Failed:", error);
  }
}
