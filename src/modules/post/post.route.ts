import { Router } from "express";
import { postController } from "./post.controller";
import { authGuard } from "../../middleware/authMiddleWare";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", postController.getAllPosts);
router.get("/stats", authGuard(Role.ADMIN), postController.getPostStats);
router.get(
  "/my-posts",
  authGuard(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.getMyPosts,
);
router.get("/:postId", postController.getSinglePost);
router.post(
  "/",
  authGuard(Role.USER, Role.AUTHOR, Role.ADMIN),
  postController.createPost,
);
router.patch(
  "/:postId",
  authGuard(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.updatePost,
);
router.delete(
  "/:postId",
  authGuard(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.deletePost,
);

export const postRoutes = router;
