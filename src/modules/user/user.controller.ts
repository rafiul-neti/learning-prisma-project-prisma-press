import { Request, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.registerUserIntoDB(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Users registered successfuly!",
    data: { user },
  });
});

export const userController = {
  registerUser,
};
