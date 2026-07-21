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
  const profile = await userService.getMyProfileFromDB(req.user?.id as string);

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "User profile fetched successfully!",
    data: profile,
  });
});

export const userController = {
  registerUser,
  getMyProfile,
};
