import { prisma } from "@/lib/db";

export const isMemberClient = async (
  workspaceId: string,
  projectId: string,
  userId: string,
) => {
  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
    },
  });

  const client = await prisma.client.findFirst({
    where: {
      userId,
      projects: {
        some: {
          id: projectId,
          workspaceId,
        },
      },
    },
  });

  return { member, client };
};
