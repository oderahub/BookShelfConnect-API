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

  /**
   * @openapi
   * /users/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       201:
   *         description: User registered
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: 'boolean' }
   *                 data: {
   *                   type: 'object',
   *                   properties: {
   *                     token: { type: 'string' }
   *                   }
   *                 }
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */

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

  /**
   * @openapi
   * /users/login:
   *   post:
   *     summary: User login
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email: { type: 'string' }
   *               password: { type: 'string' }
   *             required: ['email', 'password']
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: 'boolean' }
   *                 data: {
   *                   type: 'object',
   *                   properties: {
   *                     token: { type: 'string' }
   *                   }
   *                 }
   *       400:
   *         description: Bad request
   *       401:
   *         description: Invalid credentials
   *       500:
   *         description: Internal server error
   */

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
  /**
   * @openapi
   * /users/logout:
   *   post:
   *     summary: User logout
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: 'boolean' }
   *                 data: { type: 'boolean' }
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */

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
