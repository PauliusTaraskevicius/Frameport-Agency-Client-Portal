import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { Plan, SubscriptionStatus } from "@/generated/prisma/enums";
import Stripe from "stripe";

interface SubscriptionType extends Stripe.Subscription {
  current_period_end: number;
  current_period_start: number;
}

interface InvoiceType extends Stripe.Invoice {
  subscription: string | null;
}

export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;

      if (workspaceId && session.subscription) {
        const subscription = (await stripe.subscriptions.retrieve(
          session.subscription as string,
        )) as Stripe.Response<SubscriptionType>;

        await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: mapSubscriptionStatus(subscription.status),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as InvoiceType;
      if (invoice.subscription) {
        const subscription = (await stripe.subscriptions.retrieve(
          invoice.subscription,
        )) as Stripe.Response<SubscriptionType>;
        await updateWorkspaceFromSubscription(subscription);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as SubscriptionType;
      await updateWorkspaceFromSubscription(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as SubscriptionType;
      const workspace = await prisma.workspace.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (workspace) {
        await prisma.workspace.update({
          where: { id: workspace.id },
          data: {
            plan: Plan.STARTER,
            subscriptionStatus: SubscriptionStatus.CANCELED,
            stripeSubscriptionId: null,
            cancelAtPeriodEnd: false,
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function updateWorkspaceFromSubscription(subscription: SubscriptionType) {
  const workspace = await prisma.workspace.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!workspace) return;

  const item = subscription.items.data[0];
  const priceId =
    typeof item?.price === "string" ? item.price : item?.price?.id;

  let plan: Plan = Plan.STARTER;

  if (priceId === process.env.STRIPE_PRICE_AGENCY) plan = Plan.AGENCY;
  else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE)
    plan = Plan.ENTERPRISE;

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      plan,
      subscriptionStatus: mapSubscriptionStatus(subscription.status),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

function mapSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.ACTIVE,
    canceled: SubscriptionStatus.CANCELED,
    past_due: SubscriptionStatus.PAST_DUE,
    unpaid: SubscriptionStatus.UNPAID,
    trialing: SubscriptionStatus.TRIALING,
    paused: SubscriptionStatus.CANCELED,
    incomplete: SubscriptionStatus.UNPAID,
    incomplete_expired: SubscriptionStatus.CANCELED,
  };
  return map[status] || SubscriptionStatus.UNPAID;
}
