import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";

type TPrismaErrorResponse = {
  statusCode: number;
  message: string;
};

export const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
): TPrismaErrorResponse => {
  switch (error.code) {
    case "P2002": {
      const field = (error.meta?.target as string[])?.join(", ") ?? "field";
      return {
        statusCode: httpStatus.CONFLICT,
        message: `${field} already exists.`,
      };
    }

    case "P2025":
      return {
        statusCode: httpStatus.NOT_FOUND,
        message: (error.meta?.cause as string) ?? "Record not found.",
      };

    case "P2003":
      return {
        statusCode: httpStatus.BAD_REQUEST,
        message: "Invalid reference. Related record does not exist.",
      };

    case "P2014":
      return {
        statusCode: httpStatus.BAD_REQUEST,
        message: "This action would violate a required relation.",
      };

    default:
      return {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: `Database error (${error.code}).`,
      };
  }
};
