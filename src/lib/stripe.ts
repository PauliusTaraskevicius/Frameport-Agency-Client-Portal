import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export const getStripeCustomer = async (workspceId: string, email: string) => {
  const { prisma } = await import("./db");

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspceId,
    },
  });

  if (workspace?.stripeCustomerId) {
    return workspace.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      workspceId,
    },
  });

  await prisma.workspace.update({
    where: {
      id: workspceId,
    },
    data: {
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
};
