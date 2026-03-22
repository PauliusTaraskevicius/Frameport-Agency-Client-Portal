import { z } from "zod";
import { MemberRole } from "./types";

export const updateMemberSchema = z.object({
  id: z.string().min(1, "ID is required"),
  role: z.enum([MemberRole.OWNER, MemberRole.CLIENT], {
    error: "Role must be either OWNER or CLIENT",
  }),
});
