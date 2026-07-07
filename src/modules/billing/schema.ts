import { z } from "zod";

export const createCheckoutSchema = z.object({
  workspaceId: z.string(),
  priceId: z.string(),
});

export const createPortalSchema = z.object({
  workspaceId: z.string(),
});
