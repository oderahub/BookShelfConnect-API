import { Request, Response, NextFunction } from 'express'
import { verify, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { ApiErrors, sendError } from '../constants/error'
import { UserContext } from '../utils/user.context'
import dotenv from 'dotenv'

dotenv.config()

export interface AuthRequest extends Request {
  user?: { userId: string }
  userContext?: UserContext
}

// Create a singleton instance of UserContext
export const globalUserContext = new UserContext()

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return sendError(res, ApiErrors.UNAUTHORIZED, 401)

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing in environment variables.')
    return sendError(res, ApiErrors.INTERNAL_SERVER_ERROR, 500)
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET) as { userId: string }
    req.user = decoded

    // Set the user ID in the global context and attach to request
    globalUserContext.setUserId(decoded.userId)
    req.userContext = globalUserContext

    next()
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return sendError(res, 'Token expired. Please log in again.', 401)
    }
    if (error instanceof JsonWebTokenError) {
      return sendError(res, 'Invalid token. Authentication failed.', 401)
    }
    console.error('Unexpected token verification error:', error)
    return sendError(res, ApiErrors.INTERNAL_SERVER_ERROR, 500)
  }
}
