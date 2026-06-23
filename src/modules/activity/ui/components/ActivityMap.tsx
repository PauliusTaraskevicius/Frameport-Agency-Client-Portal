import {
  CheckSquare,
  File,
  Folder,
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Building2,
  Trash2,
  Pencil,
  Upload,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";

export interface ActivityMeta {
  label: string;
  icon: React.ReactNode;
}

const iconClass = "size-4";

export const activityMetaMap: Record<string, ActivityMeta> = {
  "task.created": {
    label: "created a task",
    icon: <CheckSquare className={iconClass} />,
  },
  "task.status_changed": {
    label: "changed task status",
    icon: <RefreshCcw className={iconClass} />,
  },
  "task.assignee_changed": {
    label: "changed task assignee",
    icon: <Users className={iconClass} />,
  },
  "task.description_changed": {
    label: "changed task description",
    icon: <Pencil className={iconClass} />,
  },
  "task.deleted": {
    label: "deleted a task",
    icon: <Trash2 className={iconClass} />,
  },

  "file.uploaded": {
    label: "uploaded a file",
    icon: <Upload className={iconClass} />,
  },
  "file.version_added": {
    label: "added a file version",
    icon: <File className={iconClass} />,
  },
  "file.deleted": {
    label: "deleted a file",
    icon: <Trash2 className={iconClass} />,
  },

  "approval.submitted": {
    label: "submitted an approval",
    icon: <Shield className={iconClass} />,
  },
  "approval.requested": {
    label: "requested an approval",
    icon: <Shield className={iconClass} />,
  },

  "member.invited": {
    label: "invited a member",
    icon: <UserPlus className={iconClass} />,
  },
  "member.removed": {
    label: "removed a member",
    icon: <UserMinus className={iconClass} />,
  },
  "member.role_changed": {
    label: "changed a member role",
    icon: <Users className={iconClass} />,
  },

  "project.created": {
    label: "created a project",
    icon: <Folder className={iconClass} />,
  },
  "project.updated": {
    label: "updated a project",
    icon: <Pencil className={iconClass} />,
  },
  "project.deleted": {
    label: "deleted a project",
    icon: <Trash2 className={iconClass} />,
  },
  "project.status_changed": {
    label: "changed project status",
    icon: <RefreshCcw className={iconClass} />,
  },

  "workspace.created": {
    label: "created the workspace",
    icon: <Building2 className={iconClass} />,
  },
  "workspace.updated": {
    label: "updated the workspace",
    icon: <Pencil className={iconClass} />,
  },
  "workspace.deleted": {
    label: "deleted the workspace",
    icon: <Trash2 className={iconClass} />,
  },
};

export function getActivityMeta(action: string): ActivityMeta {
  return (
    activityMetaMap[action] ?? {
      label: "performed an action",
      icon: <AlertCircle className={iconClass} />,
    }
  );
}
