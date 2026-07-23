import Stripe from "stripe";
import { AppError } from "../../utils/AppError";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

export const getPeriodEnd = (payload: Stripe.Subscription) => {
  const currentPeriodEndInMiliseconds =
    payload.items.data[0]?.current_period_end!;

  const currentPeriodEnd = new Date(currentPeriodEndInMiliseconds * 1000);
  return currentPeriodEnd;
};

export const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const userId = session.metadata?.userId;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
    throw new AppError(400, "Webhook Failed");
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId as string,
  );
  // console.log("stripe subscription info", stripeSubscription);

  const currentPeriodEnd = getPeriodEnd(stripeSubscription);

  // console.log(currentPeriodEnd);
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      status: "ACTIVE",
      currentPeriodEnd,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      status: "ACTIVE",
      currentPeriodEnd,
    },
  });
};

export const handleChangeSubscription = async (payload: Stripe.Subscription) => {
  const stripeSubscriptionId = payload.id;
  const status =
    payload.status === "active" || payload.status === "trialing"
      ? SubscriptionStatus.ACTIVE
      : payload.status === "canceled"
        ? SubscriptionStatus.CANCELED
        : SubscriptionStatus.EXPIRED;

  const currentPeriodEnd = getPeriodEnd(payload);

  const isSubscriptionExist = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!isSubscriptionExist) {
    console.log(
      `Webhook: No subscription found for subscriptionId: ${stripeSubscriptionId}`,
    );

    return;
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: { status, currentPeriodEnd },
  });
};
