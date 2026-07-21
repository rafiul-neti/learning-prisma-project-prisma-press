import { Request, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";

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

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;

  const updatedProfile = await userService.updateMyProfileIntoDB(
    userId,
    req.body,
  );

  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "User profile updated successfully.",
    data: { updatedProfile },
  });
});

export const userController = {
  registerUser,
  getMyProfile,
  updateMyProfile,
};
