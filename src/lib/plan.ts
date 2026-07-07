import { Plan } from "@/generated/prisma/browser";

export interface PlanLimits {
  name: string;
  price: number;
  priceId: string;
  maxProjects: number | null; // null = unlimited
  maxTeamMembers: number | null;
  maxStorageBytes: number | null;
  features: {
    clientPortal: boolean;
    magicLinkAccess: boolean;
    fileUploads: boolean;
    externalPreviewLinks: boolean;
    versionHistory: boolean;
    oneClickApprovals: boolean;
    comments: boolean;
    activityTimeline: boolean;
    emailNotifications: boolean;
    customBranding: boolean;
    customDomain: boolean;
    sharedAssetLibrary: boolean;
    projectTemplates: boolean;
    approvalReminders: boolean;
    kanbanView: boolean;
    aiWeeklyStatusSummary: boolean;
    aiCommentSummary: boolean;
    slackNotifications: boolean;
    analytics: boolean;
    advancedRoles: boolean;
    apiAccess: boolean;
    webhooks: boolean;
  };
}

export const PLANS: Record<Plan, PlanLimits> = {
  [Plan.STARTER]: {
    name: "Starter",
    price: 19,
    priceId: process.env.STRIPE_PRICE_ID_STARTER!,
    maxProjects: 3,
    maxTeamMembers: 1,
    maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    features: {
      clientPortal: true,
      magicLinkAccess: true,
      fileUploads: true,
      externalPreviewLinks: true,
      versionHistory: true,
      oneClickApprovals: true,
      comments: true,
      activityTimeline: true,
      emailNotifications: true,
      customBranding: false,
      customDomain: false,
      sharedAssetLibrary: false,
      projectTemplates: false,
      approvalReminders: false,
      kanbanView: false,
      aiWeeklyStatusSummary: false,
      aiCommentSummary: false,
      slackNotifications: false,
      analytics: false,
      advancedRoles: false,
      apiAccess: false,
      webhooks: false,
    },
  },
  [Plan.AGENCY]: {
    name: "Agency",
    price: 49,
    priceId: process.env.STRIPE_PRICE_AGENCY!,
    maxProjects: null,
    maxTeamMembers: 10,
    maxStorageBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    features: {
      clientPortal: true,
      magicLinkAccess: true,
      fileUploads: true,
      externalPreviewLinks: true,
      versionHistory: true,
      oneClickApprovals: true,
      comments: true,
      activityTimeline: true,
      emailNotifications: true,
      customBranding: true,
      customDomain: true,
      sharedAssetLibrary: true,
      projectTemplates: false,
      approvalReminders: true,
      kanbanView: true,
      aiWeeklyStatusSummary: false,
      aiCommentSummary: false,
      slackNotifications: false,
      analytics: false,
      advancedRoles: false,
      apiAccess: false,
      webhooks: false,
    },
  },
  [Plan.ENTERPRISE]: {
    name: "Enterprise",
    price: 99,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    maxProjects: null,
    maxTeamMembers: null,
    maxStorageBytes: null, // unlimited
    features: {
      clientPortal: true,
      magicLinkAccess: true,
      fileUploads: true,
      externalPreviewLinks: true,
      versionHistory: true,
      oneClickApprovals: true,
      comments: true,
      activityTimeline: true,
      emailNotifications: true,
      customBranding: true,
      customDomain: true,
      sharedAssetLibrary: true,
      projectTemplates: false,
      approvalReminders: true,
      kanbanView: true,
      aiWeeklyStatusSummary: false,
      aiCommentSummary: false,
      slackNotifications: false,
      analytics: false,
      advancedRoles: true,
      apiAccess: false,
      webhooks: false,
    },
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLANS[plan];
}

export function isFeatureEnabled(
  plan: Plan,
  features: keyof PlanLimits["features"],
): boolean {
  return PLANS[plan].features[features];
}
