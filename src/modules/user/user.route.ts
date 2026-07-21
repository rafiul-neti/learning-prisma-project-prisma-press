import { Router } from "express";
import { userController } from "./user.controller";
import { authGuard } from "../../middleware/authMiddleWare";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", userController.registerUser);

router.get(
  "/me",
  authGuard(Role.ADMIN, Role.AUTHOR, Role.USER),
  userController.getMyProfile,
);

export const userRoutes = router;
