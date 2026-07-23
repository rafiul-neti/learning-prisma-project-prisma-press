import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { subscriptionService } from "./subscription.service";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";
import httpStatus from "http-status";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const result = await subscriptionService.createCheckoutSession(
      userId as string,
    );

    sendSuccessResponse(res, {
      statusCode: httpStatus.OK,
      message: "Payment recieved",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const event = req.body as Buffer;
  const signature = req.headers["stripe-signature"] as string;

  await subscriptionService.handleWebhook(event, signature);

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Webhook triggered successfully",
    data: null,
  });
});

const getSubscriptionStatus = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const result = await subscriptionService.getSubscriptionStatus(
      userId as string,
    );

    sendSuccessResponse(res, {
      statusCode: httpStatus.OK,
      message: "Subscription status retrieved successfully",
      data: result,
    });
  },
);

export const subscriptionController = {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus
};
