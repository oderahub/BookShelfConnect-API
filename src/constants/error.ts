import { Response } from 'express'

export enum ApiErrors {
  // General Errors
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
  NOT_FOUND = 'Resource not found',
  UNAUTHORIZED = 'Authentication required',
  FORBIDDEN = 'Access denied',
  BAD_REQUEST = 'Invalid request data',
  METHOD_NOT_ALLOWED = 'Method not allowed',

  // User Specific Errors
  USER_ALREADY_EXISTS = 'User already exists',
  INVALID_CREDENTIALS = 'Invalid credentials',

  // Book Specific Errors
  BOOK_ALREADY_EXISTS = 'Book with this ISBN already exists'
}

export const sendError = (res: Response, error: ApiErrors | string, status: number = 400) => {
  res.status(status).json({
    success: false,
    error: typeof error === 'string' ? error : ApiErrors[error]
  })
}

export const sendSuccess = (
  res: Response,
  data: any,
  message: string = 'Success',
  status: number = 200
) => {
  res.status(status).json({
    success: true,
    message,
    data
  })
}
