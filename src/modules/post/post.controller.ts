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

const getAllPosts = catchAsync(async (req: Request, res: Response) => {});

const getPostStats = catchAsync(async (req: Request, res: Response) => {});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {});

const getSinglePost = catchAsync(async (req: Request, res: Response) => {});

const updatePost = catchAsync(async (req: Request, res: Response) => {});

const deletePost = catchAsync(async (req: Request, res: Response) => {});

export const postController = {
  getAllPosts,
  getPostStats,
  getMyPosts,
  getSinglePost,
  createPost,
  updatePost,
  deletePost,
};
