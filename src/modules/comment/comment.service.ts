import { prisma } from "../../lib/prisma";
import {
  ICreateCommentPayload,
  IModerateCommentPayload,
  IUpdateCommentPayload,
} from "./comment.interface";

const createCommentIntoDB = async (
  authorId: string,
  payload: ICreateCommentPayload,
) => {
  await prisma.post.findUniqueOrThrow({ where: { id: payload.postId } });

  const comment = await prisma.comment.create({
    data: { ...payload, authorId },
  });

  return comment;
};

const getCommentsByAuthorIdFromDB = async (authorId: string) => {
  const comments = await prisma.comment.findMany({
    where: {
      authorId,
    },
    orderBy: { createdAt: "desc" },
    include: { post: { select: { id: true, title: true } } },
  });

  return comments;
};

const getCommentByCommentIdFromDB = async (commentId: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { id: true, title: true, views: true } } },
  });

  return comment;
};

const getCommentsByPostIdFromDB = async (postId: string) => {
  const comment = await prisma.comment.findMany({
    where: { postId },
  });

  return comment;
};

const updateCommentByIdIntoDB = async (
  commentId: string,
  data: IUpdateCommentPayload,
  authorId: string,
) => {
  const commentData = await prisma.comment.findFirst({
    where: { id: commentId, authorId },
    select: { id: true },
  });

  if (!commentData) {
    throw new Error("Invalid input!");
  }

  const comment = await prisma.comment.update({
    where: { id: commentId, authorId },
    data,
  });

  return comment;
};

const moderateCommentIntoDB = async (
  id: string,
  data: IModerateCommentPayload,
) => {
  const commentData = await prisma.comment.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (commentData?.status === data.status) {
    throw new Error(`Status is already up to date (${data.status}).`);
  }

  const comment = await prisma.comment.update({ where: { id }, data });

  return comment;
};

const deleteCommentByIdFromDB = async (commentId: string, authorId: string) => {
  const commentData = await prisma.comment.findFirst({
    where: { id: commentId, authorId },
    select: { id: true },
  });

  if (!commentData) {
    throw new Error("Invalid input!");
  }

  const comment = await prisma.comment.delete({
    where: { id: commentData.id },
  });

  return comment;
};

export const commentService = {
  createCommentIntoDB,
  getCommentsByAuthorIdFromDB,
  getCommentByCommentIdFromDB,
  updateCommentByIdIntoDB,
  deleteCommentByIdFromDB,
  moderateCommentIntoDB,
  getCommentsByPostIdFromDB,
};
