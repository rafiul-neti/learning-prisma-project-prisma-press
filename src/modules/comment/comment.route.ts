import { Router } from "express";
import { commentController } from "./comment.controller";
import { authGuard } from "../../middleware/authMiddleWare";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  authGuard(Role.ADMIN, Role.AUTHOR, Role.USER),
  commentController.createComment,
);
router.get("/author/:authorId", commentController.getCommentsByAuthorId);
router.get("/:commentId", commentController.getCommentsByCommentId);
router.get("/post/:postId", commentController.getCommentsByPostId);
router.patch(
  "/:commentId",
  authGuard(Role.USER, Role.AUTHOR, Role.ADMIN),
  commentController.updateComment,
);
router.patch(
  "/:commentId/moderate",
  authGuard(Role.ADMIN),
  commentController.moderateComment,
);
router.delete(
  "/:commentId",
  authGuard(Role.USER, Role.AUTHOR, Role.ADMIN),
  commentController.deleteCommentById,
);

export const commentRoutes = router;
