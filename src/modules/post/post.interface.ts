import { PostStatus } from "../../../generated/prisma/enums";

export interface ICreatePostPayload {
  title: string;
  content: string;
  thumbnail?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  status?: PostStatus;
  tags: string[];
}

export interface IUpdatePostPayload {
  title?: string;
  content?: string;
  thumbnail?: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  status?: PostStatus;
  tags?: string[];
}

export interface IPostQuery {
  // Search — matches against title and/or content
  searchTerm?: string;

  // Filters — each maps to an exact-match Prisma condition
  status?: PostStatus;
  isFeatured?: string; // arrives as "true" | "false" string from query params
  authorId?: string;
  tags?: string; // comma-separated list from client, e.g. "tech,news"

  // Pagination
  page?: string;
  limit?: string;

  // Sorting
  sortBy?: string; // validate against an allowlist before using
  sortOrder?: "asc" | "desc";
}
