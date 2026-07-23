import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { SubscriptionStatus } from "../../generated/prisma/enums";

export const subscriptionGuard = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Please subscribe to get access to Premium contents.",
      );
    }

    if (subscription?.status !== SubscriptionStatus.ACTIVE) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Please subscribe again to get access to Premium contents.",
      );
    }

    next();
  });
};
