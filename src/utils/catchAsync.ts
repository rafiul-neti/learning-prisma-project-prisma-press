import { Request, Response } from "express";
import httpStatus from "http-status";

export const catchAsync = (fn: Function) => {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error: any) {
      console.log(error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to register user!",
        error: error.message,
      });
    }
  };
};
