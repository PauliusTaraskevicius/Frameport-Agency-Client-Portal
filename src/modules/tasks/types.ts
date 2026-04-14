import { Project, WorkspaceMember } from "@/generated/prisma/client";
import { TaskStatus } from "@/generated/prisma/enums";

export { TaskStatus };

// export enum TaskStatus {
//   TODO = "TODO",
//   IN_PROGRESS = "IN_PROGRESS",
//   REVIEW = "REVIEW",
//   DONE = "DONE",
// }

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  position: number;
  dueDate: string;
  projectId: string;
  assigneeId: string;
  project: Project;
  assignee: WorkspaceMember & {
    user: {
      name: string;
    }
  }
};
