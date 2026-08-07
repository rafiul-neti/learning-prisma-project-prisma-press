import { Prisma } from "../../../generated/prisma/client";
import {
  CommentStatus,
  PostStatus,
  SubscriptionStatus,
} from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import {
  ICreatePostPayload,
  IPostQuery,
  IUpdatePostPayload,
} from "./post.interface";

const createPostIntoDB = async (
  payload: ICreatePostPayload,
  userId: string,
) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (payload.isPremium && subscription?.status !== SubscriptionStatus.ACTIVE) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Subscribe to create a premium post",
    );
  }

  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};

const getAllPostsFromDB = async (query: IPostQuery) => {
  const {
    searchTerm,
    sortBy,
    sortOrder,
    status,
    page,
    limit,
    tags,
    isFeatured,
    authorId,
  } = query;

  const where: PostWhereInput = {};
  where.isPremium = false;

  if (searchTerm) {
    where.OR = [
      {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { content: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
    ];
  }

  if (status) {
    where.OR?.push({ status });
  }

  if (tags) {
    where.OR?.push({ tags: { hasSome: tags.split(",") } });
  }

  if (isFeatured) {
    where.OR?.push({ isFeatured: isFeatured === "true" });
  }

  if (authorId) {
    where.OR?.push({ authorId });
  }

  // pagination
  const currentPage = Number(page) || 1;
  const contentLimitInAPage = Number(limit) || 10;
  const skip = (currentPage - 1) * contentLimitInAPage;

  // sorting
  const orderBy: Prisma.PostOrderByWithRelationInput = sortBy
    ? { [sortBy]: sortOrder === "asc" ? "asc" : "desc" }
    : { createdAt: "desc" };

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      // where: {
      //   OR: [
      //     { title: { contains: "second", mode: "insensitive" } },
      //     { content: { contains: "second", mode: "insensitive" } },
      //   ],
      //   status: "PUBLISHED",
      // },
      where,
      orderBy,
      skip,
      take: contentLimitInAPage,
      include: { author: { omit: { password: true } }, comments: true },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    meta: {
      page: currentPage,
      limit: contentLimitInAPage,
      total: totalPosts,
    },
  };
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
      where: { id: postId, isPremium: false },
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

  if (!isAdmin || post.authorId !== authorId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are unauthorized to make changes in this post",
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: authorId },
  });

  if (payload.isPremium && subscription?.status !== SubscriptionStatus.ACTIVE) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Subscribe to update a premium post",
    );
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
