import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";
import httpStatus from "http-status";

const createPost = catchAsync(async (req: Request, res: Response) => {
  const id = req.user?.id;

  const result = await postService.createPostIntoDB(req.body, id as string);

  sendSuccessResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Post Created Successfully.",
    data: result,
  });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const posts = await postService.getAllPostsFromDB();

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Fetched all posts successfully",
    data: posts,
  });
});

const getPostStats = catchAsync(async (req: Request, res: Response) => {});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user?.id;

  const result = await postService.getMyPostsFromDB(authorId as string);

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Post retrieved successfully",
    data: result,
  });
});

const getSinglePost = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  if (!postId) {
    throw new Error("Post ID required");
  }

  const result = await postService.getSinglePostFromDB(postId as string);

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Post retrieved successfully",
    data: result,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user?.id;
  const isAdmin = req.user?.role === "ADMIN";
  const postId = req.params.postId;

  const result = await postService.updatePostIntoDB(
    postId as string,
    req.body,
    authorId as string,
    isAdmin,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Post updated successfully",
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user?.id;
  const isAdmin = req.user?.role === "ADMIN";
  const postId = req.params.postId;

  await postService.deletePostFromDB(
    postId as string,
    authorId as string,
    isAdmin,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Post deleted successfully",
    data: null,
  });
});

export const postController = {
  getAllPosts,
  getPostStats,
  getMyPosts,
  getSinglePost,
  createPost,
  updatePost,
  deletePost,
};
