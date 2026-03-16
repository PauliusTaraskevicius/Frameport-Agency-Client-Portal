import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Must be 1 or more characters")
    .max(255, "Name must be less than 255 characters"),
});

export const updateWorkspaceSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z
    .string()
    .min(1, "Must be 1 or more characters")
    .max(255, "Name must be less than 255 characters"),
});
