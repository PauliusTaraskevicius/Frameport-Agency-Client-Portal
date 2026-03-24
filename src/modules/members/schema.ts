import { z } from "zod";
import { MemberRole } from "./types";

export const updateMemberSchema = z.object({
  id: z.string().min(1, "ID is required"),
  role: z.enum([MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER], {
    error: "Role must be OWNER, ADMIN, or MEMBER",
  }),
});
