import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Must be 1 or more characters")
    .max(255, "Name must be less than 255 characters"),
  description: z
    .string()
    .max(1024, "Description must be less than 1024 characters")
    .optional(),
  clientId: z.string().min(1, "Client ID is required"),
});

export const updateProjectSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z
    .string()
    .min(1, "Must be 1 or more characters")
    .max(255, "Name must be less than 255 characters"),
  description: z
    .string()
    .max(1024, "Description must be less than 1024 characters")
    .optional(),
});
