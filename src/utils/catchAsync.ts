import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

export const catchAsync = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (error: any) {
      // console.log(error);
      next(error);
    }
  };
};
