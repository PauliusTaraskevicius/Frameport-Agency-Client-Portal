"use client";

import { ActivityLog } from "@/generated/prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getActivityMeta } from "./ActivityMap";
import Link from "next/link";

type ActivityLogWithMember = ActivityLog & {
  member: {
    user: {
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    } | null;
  } | null;
};

interface ActivityItemProps {
  log: ActivityLogWithMember;
}

function getMetadataValue(meta: unknown, key: string): string | undefined {
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    return (meta as Record<string, unknown>)[key] as string | undefined;
  }
  return undefined;
}

function getEntityTitle(log: ActivityLogWithMember): string | undefined {
  return (
    getMetadataValue(log.metadata, "title") ||
    getMetadataValue(log.metadata, "name") ||
    getMetadataValue(log.metadata, "fileName")
  );
}

function getActivityHref(log: ActivityLogWithMember): string | null {
  if (!log.workspaceId) return null;

  if (log.entityType === "Task") {
    return `/dashboard/workspaces/${log.workspaceId}/tasks/${log.entityId}`;
  }
  if (log.entityType === "Project") {
    return `/dashboard/workspaces/${log.workspaceId}/projects/${log.entityId}`;
  }
  if (log.entityType === "File" && log.projectId) {
    return `/dashboard/workspaces/${log.workspaceId}/projects/${log.projectId}/files/${log.entityId}`;
  }
  return null;
}

export const ActivityItem = ({ log }: ActivityItemProps) => {
  const meta = getActivityMeta(log.action);
  const userName = log.member?.user?.firstName
    ? `${log.member.user.firstName} ${log.member.user.lastName ?? ""}`.trim()
    : "Unknown";

  const oldValue = getMetadataValue(log.metadata, "oldValue");
  const newValue = getMetadataValue(log.metadata, "newValue");
  const entityTitle = getEntityTitle(log);
  const href = getActivityHref(log);

  return (
    <div className="flex items-start gap-x-3 border-b py-3 last:border-b-0">
      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        {meta.icon}
      </div>
      <div className="flex flex-col gap-y-1">
        <p className="text-sm">
          <span className="font-medium">{userName}</span>{" "}
          <span className="text-muted-foreground">{meta.label}</span>
          {entityTitle && href && (
            <>
              {" "}
              <Link
                href={href}
                className="font-medium text-foreground hover:underline"
              >
                [{entityTitle}]
              </Link>
            </>
          )}
          {entityTitle && !href && (
            <span className="font-medium text-foreground"> [{entityTitle}]</span>
          )}
        </p>
        {(oldValue !== undefined || newValue !== undefined) && (
          <div className="flex flex-wrap items-center gap-x-2">
            {oldValue !== undefined && (
              <Badge variant="secondary">{oldValue}</Badge>
            )}
            {oldValue !== undefined && newValue !== undefined && (
              <span className="text-muted-foreground text-xs">→</span>
            )}
            {newValue !== undefined && (
              <Badge variant="default">{newValue}</Badge>
            )}
          </div>
        )}
        <span className="text-muted-foreground text-xs">
          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};
