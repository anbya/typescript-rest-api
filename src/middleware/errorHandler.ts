import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { apiLogger } from '../utils/logger';

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const handleError = (err: ApiError, res: Response): void => {
  const { statusCode, message } = err;
  res.status(statusCode).json({
    success: false,
    status: "error",
    statusCode,
    message,
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

  const errorCodes: Record<string, string> = {
    "08003": "connection_does_not_exist",
    "08006": "connection_failure",
    "2F002": "modifying_sql_data_not_permitted",
    "57P03": "cannot_connect_now",
    "42601": "syntax_error",
    "42501": "insufficient_privilege",
    "42602": "invalid_name",
    "42622": "name_too_long",
    "42939": "reserved_name",
    "42703": "undefined_column",
    "42000": "syntax_error_or_access_rule_violation",
    "42P01": "undefined_table",
    "42P02": "undefined_parameter",
  };

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
