import { Router } from "express";
import { premiumController } from "./premium.controller";
import { authGuard } from "../../middleware/authMiddleWare";
import { Role } from "../../../generated/prisma/enums";
import { subscriptionGuard } from "../../middleware/subscriptionGuard";

const router = Router();

router.get(
  "/",
  authGuard(Role.USER, Role.AUTHOR, Role.ADMIN),
  subscriptionGuard(),
  premiumController.getPremiumContent,
);

export const premiumRoutes = router;
