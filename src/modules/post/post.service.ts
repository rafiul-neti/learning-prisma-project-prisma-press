import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IUpdatePostPayload } from "./post.interface";

const createPostIntoDB = async (
  payload: ICreatePostPayload,
  userId: string,
) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};

const getAllPostsFromDB = async () => {
  const posts = await prisma.post.findMany({
    include: { author: { omit: { password: true } }, comments: true },
  });

  return posts;
};

const getPostsStatsFromDB = async () => {};

const getMyPostsFromDB = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    include: {
      comments: true,
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return result;
};

const getSinglePostFromDB = async (postId: string) => {
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId } });

  const increasePostViewCount = await prisma.post.update({
    where: { id: postId },
    data: { views: { increment: 1 } },
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });

  return increasePostViewCount;
};

const updatePostIntoDB = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId } });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("Forbidden!");
  }

  const result = await prisma.post.update({
    where: { id: postId },
    data: payload,
    include: {
      author: { omit: { password: true } },
      comments: true,
    },
  });

  return result;
};

const deletePostFromDB = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId } });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("Forbidden!");
  }

  await prisma.post.delete({ where: { id: postId } });
};

export const postService = {
  getAllPostsFromDB,
  getPostsStatsFromDB,
  getMyPostsFromDB,
  getSinglePostFromDB,
  createPostIntoDB,
  updatePostIntoDB,
  deletePostFromDB,
};
