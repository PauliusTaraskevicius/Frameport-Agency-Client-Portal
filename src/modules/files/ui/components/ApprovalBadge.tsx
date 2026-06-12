import { ApprovalStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";

const config: Record<ApprovalStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  REVISION_REQUESTED: {
    label: "Revision Requested",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

interface ApprovalBadgeProps {
  status: ApprovalStatus | undefined;
}

export const ApprovalBadge = ({ status }: ApprovalBadgeProps) => {
  if (!status) return null;

  const { label, className } = config[status];

  return <Badge className={className}>{label}</Badge>;
};
