import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { apiLogger } from '../utils/logger';
import errorCodes from './errorCodes';

export class ApiError extends Error {
  public statusCode: number;
  public timestamp: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    this.timestamp = new Date().toISOString();
  }
}

export const handleError = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode, message } = err;
  res.status(statusCode).json({
    success: false,
    status: "error",
    statusCode,
    message,
    timestamp: err.timestamp || new Date().toISOString(),
  });
};

export const convertToApiError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  apiLogger('error', `${error.stack}`);

  if (!(error instanceof ApiError)) {
    if (error.code !== undefined) {
      if (errorCodes[error.code]) {
        const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        const message = `code (${error.code}): ${errorCodes[error.code]}`;
        error = new ApiError(statusCode, message);
      } else {
        const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        const message = "Database unidentified error";
        error = new ApiError(statusCode, message);
      }
    } else {
      const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || httpStatus[statusCode as keyof typeof httpStatus];
      error = new ApiError(statusCode, message);
    }
  }

  apiLogger('error', `${error.message}`);
  next(error);
};
