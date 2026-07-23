import { NextFunction, Request, Response } from "express";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { Role } from "../../generated/prisma/enums";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}

export const authGuard = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken
        ? req.cookies.accessToken
        : req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization?.split(" ")[1]
          : req.headers.authorization;

      if (!token) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Forbidden. You don't have permission to access this resource!",
        );
      }

      const verifiedToken = jwtUtils.verifyToken(
        token as string,
        config.jwt_access_secret,
      );

      if (!verifiedToken.success) {
        throw new AppError(httpStatus.UNAUTHORIZED, verifiedToken.error);
      }

      const { id, name, email, role } = verifiedToken.data as JwtPayload;

      if (roles.length && !roles.includes(role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Forbidden. You don't have permission to access this resource!",
        );
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          "User not found. Please log in again.",
        );
      }

      if (user.activeStatus === "BLOCKED") {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Your account has been blocked. Please contact support!",
        );
      }

      req.user = { id, name, email, role };
      next();
    } catch (error) {
      next(error);
    }
  };
};
