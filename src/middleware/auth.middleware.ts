import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'
import { ApiErrors, sendError } from '../constants/error'
import { UserContext } from '../utils/user.context'
import dotenv from 'dotenv'

dotenv.config()

export interface AuthRequest extends Request {
  user?: { userId: string }
  userContext?: UserContext
}

export const globalUserContext = new UserContext()

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, ApiErrors.UNAUTHORIZED, 401)
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return sendError(res, ApiErrors.UNAUTHORIZED, 401)
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error('JWT_SECRET is missing in environment variables.')
      return sendError(res, ApiErrors.INTERNAL_SERVER_ERROR, 500)
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string }
    if (!decoded || !decoded.userId) {
      return sendError(res, 'Invalid token payload', 401)
    }

    req.user = { userId: decoded.userId }
    globalUserContext.setUserId(decoded.userId)
    req.userContext = globalUserContext

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendError(res, 'Token expired. Please log in again.', 401)
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return sendError(res, 'Invalid token. Authentication failed.', 401)
    }
    console.error('Unexpected token verification error:', error)
    return sendError(res, ApiErrors.INTERNAL_SERVER_ERROR, 500)
  }
}
