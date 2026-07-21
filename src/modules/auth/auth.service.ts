import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload, SignOptions } from "jsonwebtoken";

const loginUserIntoApp = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  if (user.activeStatus === "BLOCKED") {
    throw new Error(
      "Your account has been blocked. Please contact to our support!",
    );
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new Error("Password is incorrect!");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_referesh_secret,
    config.jwt_refresh_expires_in,
  );

  return { accessToken, refreshToken };
};

const refreshToken = async (token: string) => {
  const verifyRefreshToken = jwtUtils.verifyToken(
    token,
    config.jwt_referesh_secret,
  );

  if (!verifyRefreshToken.success) {
    throw new Error(verifyRefreshToken.error);
  }

  const { id } = verifyRefreshToken.data as JwtPayload;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  if (user.activeStatus === "BLOCKED") {
    throw new Error("User is blocked.");
  }

  const jwtPayload = {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  return { accessToken };
};

export const authService = {
  loginUserIntoApp,
  refreshToken,
};
