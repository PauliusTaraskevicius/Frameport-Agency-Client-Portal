import z from "zod";
import { TaskStatus } from "./types";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().max(1024, "Description is too long").optional(),
  status: z
    .enum(
      [
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.REVIEW,
        TaskStatus.DONE,
      ],
      "Invalid task status",
    )
    .default(TaskStatus.TODO),
  projectId: z.string().min(1, "Project ID is required"),
  assigneeId: z.string().min(1, "Assignee ID is required"),
  workspaceId: z.string().trim().min(1, "Workspace ID is required"),
  dueDate: z.coerce.date("Invalid date format"),
});
