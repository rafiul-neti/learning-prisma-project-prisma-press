import { Prisma } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IPostQuery } from "../post/post.interface";

const getPremiumContent = async (query: IPostQuery) => {
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
  where.isPremium = true;

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { content: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (tags) {
    where.tags = { hasSome: tags.split(",") };
  }

  if (isFeatured) {
    where.isFeatured = isFeatured === "true";
  }

  if (authorId) {
    where.authorId = authorId;
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
      include: {
        author: { omit: { password: true } },
        comments: true,
        _count: { select: { comments: true } },
      },
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

export const premiumService = {
  getPremiumContent,
};
