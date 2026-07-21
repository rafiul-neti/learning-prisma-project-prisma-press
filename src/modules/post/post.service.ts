import { prisma } from "../../lib/prisma";
import { ICreatePostPayload } from "./post.interface";

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

const getAllPostsFromDB = async () => {};

const getPostsStatsFromDB = async () => {};

const getMyPostsFromDB = async () => {};

const getSinglePostFromDB = async () => {};

const updatePostIntoDB = async () => {};

const deletePostFromDB = async () => {};

export const postService = {
  getAllPostsFromDB,
  getPostsStatsFromDB,
  getMyPostsFromDB,
  getSinglePostFromDB,
  createPostIntoDB,
  updatePostIntoDB,
  deletePostFromDB,
};
