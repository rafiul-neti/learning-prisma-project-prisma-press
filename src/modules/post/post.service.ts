import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
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

const getPostsStatsFromDB = async () => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      totalPublishedPosts,
      totalDraftedPosts,
      totalArchievedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      countViewsOfAllPosts,
    ] = await Promise.all([
      tx.post.count(),
      tx.post.count({
        where: { status: PostStatus.PUBLISHED },
      }),
      tx.post.count({
        where: { status: PostStatus.DRAFT },
      }),
      tx.post.count({
        where: { status: PostStatus.ARCHIEVED },
      }),
      tx.comment.count(),
      tx.comment.count({
        where: { status: CommentStatus.APPROVED },
      }),
      tx.comment.count({
        where: { status: CommentStatus.REJECTED },
      }),
      tx.post.aggregate({
        _sum: { views: true },
      }),
    ]);

    return {
      totalPosts,
      totalPublishedPosts,
      totalDraftedPosts,
      totalArchievedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalViews: countViewsOfAllPosts._sum.views ?? 0,
    };
  });

  return transactionResult;
};

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
  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    const post = await tx.post.findUniqueOrThrow({
      where: { id: postId },
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

    return post;
  });

  return transactionResult;
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
