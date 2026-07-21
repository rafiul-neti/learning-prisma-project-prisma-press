import { Request, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";
import jwt from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.registerUserIntoDB(req.body);

  sendSuccessResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "User registered successfully!",
    data: { user },
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { accessToken } = req.cookies;
  console.log(accessToken);

  const verifiedToken = jwtUtils.verifyToken(
    accessToken,
    config.jwt_access_secret,
  );

  if (typeof verifiedToken === "string") {
    throw new Error(verifiedToken);
  }

  const profile = await userService.getMyProfileFromDB(verifiedToken.id);

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "User profile fetched successfully!",
    data: { ...profile },
  });
});

export const userController = {
  registerUser,
  getMyProfile,
};
