import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { commentService } from "./comment.service";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";
import httpStatus from "http-status";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user?.id as string;

  const result = await commentService.createCommentIntoDB(authorId, req.body);

  sendSuccessResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Comment created successfully",
    data: result,
  });
});

const getCommentsByAuthorId = catchAsync(
  async (req: Request, res: Response) => {
    const { authorId } = req.params;

    const result = await commentService.getCommentsByAuthorIdFromDB(
      authorId as string,
    );

    sendSuccessResponse(res, {
      statusCode: httpStatus.OK,
      message: "Comment(s) retrieved successfully.",
      data: result,
    });
  },
);

const getCommentsByCommentId = catchAsync(
  async (req: Request, res: Response) => {
    const { commentId } = req.params;

    const result = await commentService.getCommentByCommentIdFromDB(
      commentId as string,
    );

    sendSuccessResponse(res, {
      statusCode: httpStatus.OK,
      message: "Comment retrieved successfully.",
      data: result,
    });
  },
);

const getCommentsByPostId = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;

  const result = await commentService.getCommentsByPostIdFromDB(
    postId as string,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Comment retrieved successfully.",
    data: result,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user?.id as string;
  const commentId = req.params.commentId as string;

  const result = await commentService.updateCommentByIdIntoDB(
    commentId,
    req.body,
    authorId,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Comment updated successfully.",
    data: result,
  });
});

const moderateComment = catchAsync(async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;

  const result = await commentService.moderateCommentIntoDB(
    commentId,
    req.body,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Comment moderated successfully.",
    data: result,
  });
});

const deleteCommentById = catchAsync(async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const authorId = req.user?.id as string;

  await commentService.deleteCommentByIdFromDB(commentId, authorId);

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Comment deleted successfully.",
    data: null,
  });
});

export const commentController = {
  createComment,
  getCommentsByAuthorId,
  getCommentsByCommentId,
  getCommentsByPostId,
  updateComment,
  deleteCommentById,
  moderateComment,
};
