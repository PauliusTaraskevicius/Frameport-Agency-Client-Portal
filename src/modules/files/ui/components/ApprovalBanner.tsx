"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { ApprovalBadge } from "./ApprovalBadge";
import { useRequestApproval } from "../../api/use-request-approval";
import { useSubmitApproval } from "../../api/use-submit-approval";
import type { ApprovalStatus, Client } from "@/generated/prisma/client";
import { Status } from "../../types";

interface Approval {
  id: string;
  status: ApprovalStatus;
  note: string | null;
  client: Client | null;
}

interface ApprovalBannerProps {
  fileId: string;
  projectId: string;
  fileVersionId: string;
  approval: Approval | undefined;
  isClient: boolean;
  /** clientId of the project — needed when team sends for approval */
  projectClientId: string;
}

export const ApprovalBanner = ({
  fileId,
  projectId,
  fileVersionId,
  approval,
  isClient,
  projectClientId,
}: ApprovalBannerProps) => {
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const requestApproval = useRequestApproval(fileId);
  const submitApproval = useSubmitApproval(fileId);

  // --- Team view ---
  if (!isClient) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {approval ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Approval status</span>
                  <ApprovalBadge status={approval.status} />
                </div>
                {approval.note && (
                  <p className="text-muted-foreground text-sm">
                    &ldquo;{approval.note}&rdquo;
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                This version has not been sent for approval yet.
              </p>
            )}
          </div>
          <Button
            size="sm"
            disabled={!!approval || requestApproval.isPending}
            onClick={() =>
              requestApproval.mutate(
                { projectId, fileVersionId, clientId: projectClientId },
                { onSuccess: () => toast.success("Sent for approval") },
              )
            }
          >
            {approval ? "Sent for Approval" : "Send for Approval"}
          </Button>
        </div>
      </div>
    );
  }

  // --- Client view ---
  if (!approval || approval.status !== "PENDING") {
    return (
      <div className="flex items-center gap-2 rounded-lg border p-4">
        <span className="text-sm font-medium">Your decision:</span>
        <ApprovalBadge status={approval?.status} />
        {!approval && (
          <span className="text-muted-foreground text-sm">
            Awaiting submission from team.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <p className="text-sm font-medium">
        This version is awaiting your approval.
      </p>

      {showNote && (
        <Textarea
          placeholder="Add a note (optional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="resize-none"
          rows={3}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={submitApproval.isPending}
          onClick={() =>
            submitApproval.mutate(
              {
                approvalId: approval.id,
                status: Status.APPROVED,
                note: note || undefined,
              },
              { onSuccess: () => toast.success("Approved!") },
            )
          }
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={submitApproval.isPending}
          onClick={() => {
            setShowNote(true);
            if (!showNote) return;
            submitApproval.mutate(
              {
                approvalId: approval.id,
                status: Status.REJECTED,
                note: note || undefined,
              },
              { onSuccess: () => toast.error("Rejected") },
            );
          }}
        >
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={submitApproval.isPending}
          onClick={() => {
            setShowNote(true);
            if (!showNote) return;
            submitApproval.mutate(
              {
                approvalId: approval.id,
                status: Status.REVISION_REQUESTED,
                note: note || undefined,
              },
              { onSuccess: () => toast.success("Revision requested") },
            );
          }}
        >
          Request Revision
        </Button>
        {!showNote && (
          <Button size="sm" variant="ghost" onClick={() => setShowNote(true)}>
            Add note
          </Button>
        )}
      </div>
    </div>
  );
};
