"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ActivityItem } from "./ActivityItem";
import { ActivityLog } from "@/generated/prisma/client";

type ActivityLogWithMember = ActivityLog & {
  member: {
    user: {
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    } | null;
  } | null;
};

interface ActivityFeedProps {
  logs: ActivityLogWithMember[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  error?: { message: string } | null;
}

export const ActivityFeed = ({
  logs,
  totalPages,
  currentPage,
  onPageChange,
  isLoading,
  emptyMessage,
  error,
}: ActivityFeedProps) => {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive py-8 text-center text-sm">
        {error.message}
      </p>
    );
  }

  if (!logs.length) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        {emptyMessage ?? "No activity yet"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      {logs.map((log) => (
        <ActivityItem key={log.id} log={log} />
      ))}

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
