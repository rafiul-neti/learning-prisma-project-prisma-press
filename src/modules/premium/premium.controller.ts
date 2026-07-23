import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccessResponse } from "../../utils/sendSuccessResponse";
import httpStatus from "http-status";
import { premiumService } from "./premium.service";

const getPremiumContent = catchAsync(async (req: Request, res: Response) => {
  const result = await premiumService.getPremiumContent(req.query);
  sendSuccessResponse(res, {
    statusCode: httpStatus.OK,
    message: "Premium contents retieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const premiumController = {
  getPremiumContent,
};
