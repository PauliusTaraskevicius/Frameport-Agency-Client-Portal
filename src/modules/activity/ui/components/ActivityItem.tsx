"use client";

import { ActivityLog } from "@/generated/prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getActivityMeta } from "./ActivityMap";
import { unknown } from "zod";

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

export const ActivityItem = ({ log }: ActivityItemProps) => {
  const meta = getActivityMeta(log.action);
  const userName = log.member?.user?.firstName
    ? `${log.member.user.firstName} ${log.member.user.lastName ?? ""}`.trim()
    : "Unknown";

  const oldValue = getMetadataValue(log.metadata, "oldValue");
  const newValue = getMetadataValue(log.metadata, "newValue");

  return (
    <div className="flex items-start gap-x-3 border-b py-3 last:border-b-0">
      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        {meta.icon}
      </div>
      <div className="flex flex-col gap-y-1">
        <p className="text-sm">
          <span className="font-medium">{userName}</span>{" "}
          <span className="text-muted-foreground">{meta.label}</span>
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
