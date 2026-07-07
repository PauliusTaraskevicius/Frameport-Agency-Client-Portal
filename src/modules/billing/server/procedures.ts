import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { stripe, getStripeCustomer } from "@/lib/stripe";
import { PLANS } from "@/lib/plan";
import { createCheckoutSchema, createPortalSchema } from "../schema";
import { MemberRole } from "@/modules/members/types";

export const billingRouter = createTRPCRouter({
  getPlans: protectedProcedure.query(async () => {
    return Object.entries(PLANS).map(([key, plan]) => ({
      key,
      name: plan.name,
      price: plan.price,
      priceId: plan.priceId,
      maxProjects: plan.maxProjects,
      maxTeamMembers: plan.maxTeamMembers,
      maxStorageGg: plan.maxStorageBytes
        ? plan.maxStorageBytes / (1024 * 1024 * 1024)
        : null,
      features: plan.features,
    }));
  }),

  getSubscription: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await prisma.workspaceMember.findFirst({
        where: { workspaceId: input.workspaceId, userId: ctx.auth.userId },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      const workspace = await prisma.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return {
        plan: workspace.plan,
        status: workspace.subscriptionStatus,
        cancelAtPeriodEnd: workspace.cancelAtPeriodEnd,
        currentPeriodEnd: workspace.currentPeriodEnd,
      };
    }),

  createCheckoutSession: protectedProcedure
    .input(createCheckoutSchema)
    .mutation(async ({ ctx, input }) => {
      const member = await prisma.workspaceMember.findFirst({
        where: { workspaceId: input.workspaceId, userId: ctx.auth.userId },
      });

      if (!member || member.role !== MemberRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners can manage billing.",
        });
      }

      const user = await prisma.user.findUnique({
        where: { clerkUserId: ctx.auth.userId },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const customerId = await getStripeCustomer(input.workspaceId, user.email);

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: input.priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspaces/${input.workspaceId}/settings/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspaces/${input.workspaceId}/settings/billing?canceled=true`,
      });

      return { url: session.url };
    }),

  createPortal: protectedProcedure
    .input(createPortalSchema)
    .mutation(async ({ ctx, input }) => {
      const member = await prisma.workspaceMember.findFirst({
        where: { workspaceId: input.workspaceId, userId: ctx.auth.userId },
      });

      if (!member || member.role !== MemberRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners can manage billing",
        });
      }

      const workspace = await prisma.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace?.stripeCustomerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Stripe customer found",
        });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: workspace.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspaces/${input.workspaceId}/settings/billing`,
      });

      return { url: session.url };
    }),
});
