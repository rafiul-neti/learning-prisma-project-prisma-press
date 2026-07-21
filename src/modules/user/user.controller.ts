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

export const userController = {
  registerUser,
};
