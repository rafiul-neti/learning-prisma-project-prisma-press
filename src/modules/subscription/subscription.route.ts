import { Router } from "express";
import { subscriptionController } from "./subscription.controller";
import { authGuard } from "../../middleware/authMiddleWare";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/checkout",
  authGuard(Role.USER, Role.AUTHOR, Role.ADMIN),
  subscriptionController.createCheckoutSession,
);

router.post("/webhook", subscriptionController.handleWebhook);

router.get(
  "/status",
  authGuard(Role.USER, Role.AUTHOR, Role.ADMIN),
  subscriptionController.getSubscriptionStatus,
);

export const subscriptionRoutes = router;
