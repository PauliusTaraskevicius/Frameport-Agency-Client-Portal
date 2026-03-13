import { z } from "zod";

export const createInvitationSchema = z.object({
  workspaceId: z.string().min(1),
  email: z.string().email(),
  clientId: z.string().optional(),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});
