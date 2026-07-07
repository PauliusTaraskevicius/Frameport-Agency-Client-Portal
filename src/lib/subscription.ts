import { prisma } from "./db";
import { Plan, SubscriptionStatus } from "@/generated/prisma/browser";
import { PLANS, PlanLimits } from "./plan";

export async function getWorkspaceSubscription(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    return null;
  }

  return {
    plan: workspace.plan,
    status: workspace.subscriptionStatus,
    cancelAtPeriodEnd: workspace.cancelAtPeriodEnd,
    currentPeriodEnd: workspace.currentPeriodEnd,
    stripeCustomerId: workspace.stripeCustomerId,
    stripeSubscriptionId: workspace.stripeSubscriptionId,
  };
}

export async function checkPlanLimit(
  workspaceId: string,
  type: "projects" | "members" | "storage",
): Promise<{
  allowed: boolean;
  current: number;
  limit: number | null;
  plan: Plan;
}> {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      _count: {
        select: {
          projects: true,
          members: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const limits = PLANS[workspace.plan];

  if (type === "projects") {
    return {
      allowed:
        limits.maxTeamMembers === null ||
        workspace._count.members < limits.maxTeamMembers,
      current: workspace._count.members,
      limit: limits.maxTeamMembers,
      plan: workspace.plan,
    };
  }

  if (type === "members") {
    return {
      allowed:
        limits.maxTeamMembers === null ||
        workspace._count.members < limits.maxTeamMembers,
      current: workspace._count.members,
      limit: limits.maxTeamMembers,
      plan: workspace.plan,
    };
  }

  if (type === "storage") {
    const files = await prisma.file.aggregate({
      where: { project: { workspaceId } },
      _sum: { size: true },
    });
    const currentStorage = files._sum.size ?? 0;
    return {
      allowed:
        limits.maxStorageBytes === null ||
        currentStorage < limits.maxStorageBytes,
      current: currentStorage,
      limit: limits.maxStorageBytes,
      plan: workspace.plan,
    };
  }

  throw new Error("Invalid limit type");
}

export async function requireFeature(
  workspaceId: string,
  feature: keyof PlanLimits["features"],
) {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const enabled = PLANS[workspace.plan].features[feature];
  if (!enabled) {
    throw new Error(
      `Feature ${feature} is not enabled for plan ${workspace.plan}`,
    );
  }
}
