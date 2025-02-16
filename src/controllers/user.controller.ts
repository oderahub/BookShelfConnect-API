import { Request, Response } from 'express'
import { UserService } from '../services/user.service'
import { BaseController } from './base.controller'
import { User } from '../types'
import { sendError } from '../constants/error'
import { logger } from '../utils/logger'

export class UserController extends BaseController<User> {
  constructor() {
    super(new UserService())
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await (this.service as UserService).register(req.body)
      if (result.success) {
        res.status(201).json(result)
      } else {
        sendError(res, result.error ?? 'Registration failed', 400)
      }
    } catch (error) {
      logger.error('❌ Error in register:', error)
      sendError(res, 'Internal server error', 500)
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400)
      }

      const result = await (this.service as UserService).login(email, password)
      if (result.success) {
        res.status(200).json(result)
      } else {
        sendError(res, 'Invalid credentials', 401)
      }
    } catch (error) {
      logger.error('❌ Error in login:', error)
      sendError(res, 'Internal server error', 500)
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Extract token from request headers or cookies
      const token = req.headers.authorization?.split(' ')[1] || req.cookies.token
      const result = await (this.service as UserService).logout(token)
      if (result.success) {
        res.status(200).json(result)
      } else {
        sendError(res, result.error ?? 'Logout failed', 400)
      }
    } catch (error) {
      console.error('❌ Error in logout:', error)
      sendError(res, 'Internal server error', 500)
    }
  }
}
